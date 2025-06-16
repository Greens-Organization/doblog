import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { eq } from 'drizzle-orm'
import { checkUserCategories } from '../../user/services'
import type { IPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid Post ID')
})

export async function updatePost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['moveToDraft']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = session!.user.role === 'admin'

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          (parsedParam.error as zod.ZodError).issues
            .map((e) => e.message)
            .join('; ')
        )
      )
    }
    const { id } = parsedParam.data

    // Check if the post exists
    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id)
    })

    if (!existingPost) {
      return left(new NotFoundError('Post not found'))
    }

    // Parse the request body
    const bodyData = await request.json()

    const parsed = createPostSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('| ')
        )
      )
    }

    // Check if the user has permission to create posts
    const checkUser = await checkUserCategories({
      userId: session?.user.id!
    })
    if (isLeft(checkUser)) {
      return left(checkUser.value)
    }
    const { categories: userCategories, subcategories: userSubcategories } =
      checkUser.value

    // Check if the slug is already used by another post
    const categoryData = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.category_slug)
    })

    if (!categoryData) {
      return left(new ValidationError('Category not found'))
    }

    if (!userCategories.some((c) => c.slug === categoryData.slug) && !isAdmin) {
      return left(
        new UnauthorizedError(
          'You do not have permission to create posts in this category'
        )
      )
    }

    // If subcategorySlug is not provided, use the default slug format
    const subcategorySlug = parsed.data.subcategory_slug
      ? parsed.data.subcategory_slug
      : `${parsed.data.category_slug}-default`

    const subcategoryData = await db.query.subcategory.findFirst({
      where: eq(subcategory.slug, subcategorySlug)
    })

    if (!subcategoryData) {
      return left(
        new ValidationError(
          subcategorySlug.includes('default')
            ? 'Subcategory default slug not found'
            : 'Subcategory not found'
        )
      )
    }

    if (
      !userSubcategories.find(
        (subcategoryData) => subcategoryData.slug === subcategorySlug
      ) &&
      !isAdmin
    ) {
      return left(
        new UnauthorizedError(
          'You do not have permission to create posts in this subcategory'
        )
      )
    }

    // Check if a post with the same slug already exists
    const existPostWithThisSlug = await db.query.post.findFirst({
      where: eq(post.slug, parsed.data.slug)
    })

    if (existPostWithThisSlug) {
      return left(new ConflictError('Post with this slug already exists'))
    }

    // Update the post
    const [data] = await db
      .update(post)
      .set({
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        featuredImage: parsed.data.featured_image,
        content: parsed.data.content,
        subcategoryId: subcategoryData.id
      })
      .returning()

    const { createdAt, updatedAt, ...categoryDataFiltered } = categoryData

    return right({ ...data, category: categoryDataFiltered })
  } catch (error) {
    return left(serviceHandleError(error, 'updatePost'))
  }
}
