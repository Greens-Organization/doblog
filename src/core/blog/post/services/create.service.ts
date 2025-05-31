import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { AccessHandler } from '@/infra/helpers/handlers/access-handler'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { eq } from 'drizzle-orm'
import { UserRole } from '../../user/dto'
import type { IPostDTO } from '../dto'

export async function createPost(
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

    const bodyData = await request.json()

    const parsed = createPostSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('| ')
        )
      )
    }

    const categoryData = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.categorySlug)
    })

    if (!categoryData) {
      return left(new ValidationError('Category not found'))
    }

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

    const existPostWithThisSlug = await db.query.post.findFirst({
      where: eq(post.slug, parsed.data.slug)
    })

    if (existPostWithThisSlug) {
      return left(new ConflictError('Post with this slug already exists'))
    }

    const [data] = await db
      .insert(post)
      .values({
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        featuredImage: parsed.data.featuredImage,
        content: parsed.data.content,
        subcategoryId: subcategoryData.id,
        authorId: sessionResult.value?.user.id!
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
