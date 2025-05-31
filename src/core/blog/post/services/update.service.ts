import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { AccessHandler } from '@/infra/helpers/handlers/access-handler'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { eq } from 'drizzle-orm'
import { UserRole } from '../../user/dto'
import type { IPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid Post ID')
})

export async function updatePost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    // Check if user has access to create a post
    if (
      !sessionResult.value ||
      !AccessHandler.hasAccessByRole(sessionResult.value.user.role, [
        UserRole.ADMIN,
        UserRole.EDITOR
      ])
    ) {
      return left(
        new UnauthorizedError('Access denied: Admins and Editor only')
      )
    }
    // TODO: Add a check for the user's permissions to create a post in a specific category

    const parsedParam = extractAndValidatePathParam(request, pathParamSchema)
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

    // Check if the slug is already used by another post
    const categoryData = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.categorySlug)
    })

    if (!categoryData) {
      return left(new ValidationError('Category not found'))
    }

    // If subcategorySlug is not provided, use the default slug format
    const subcategorySlug = parsed.data.subcategorySlug
      ? parsed.data.subcategorySlug
      : `${parsed.data.categorySlug}-default`

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
        featuredImage: parsed.data.featuredImage,
        content: parsed.data.content,
        subcategoryId: subcategoryData.id
      })
      .returning()

    const { createdAt, updatedAt, ...categoryDataFiltered } = categoryData

    return right({ ...data, category: categoryDataFiltered })
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('Unhandled error in createSubcategory:', error)
    return left(new DatabaseError())
  }
}
