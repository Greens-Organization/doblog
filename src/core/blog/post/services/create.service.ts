import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { auth } from '@/infra/lib/better-auth/auth'
import type { zod } from '@/infra/lib/zod'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { eq } from 'drizzle-orm'
import { checkUserCategories } from '../../user/services'
import type { IPostDTO } from '../dto'

export async function createPost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = session!.user.role === 'admin'

    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['create']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const bodyData = await request.json()

    const parsed = createPostSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('| ')
        )
      )
    }

    const existPostWithThisSlug = await db.query.post.findFirst({
      where: eq(post.slug, parsed.data.slug)
    })

    if (existPostWithThisSlug) {
      return left(new ConflictError('Post with this slug already exists'))
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

    // Check if the user has permission to create posts in the specified category
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

    const data = await db.transaction(async (tx) => {
      const [postCreated] = await tx
        .insert(post)
        .values({
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: parsed.data.excerpt,
          featuredImage: parsed.data.featured_image,
          content: parsed.data.content,
          subcategoryId: subcategoryData.id,
          authorId: sessionResult.value?.user.id!
        })
        .returning()
      return postCreated
    })

    const { createdAt, updatedAt, ...categoryDataFiltered } = categoryData

    return right({
      body: { ...data, category: categoryDataFiltered },
      statusCode: 201
    })
  } catch (error) {
    return left(serviceHandleError(error, 'createPost'))
  }
}
