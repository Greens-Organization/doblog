import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category, subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { logger } from '@/infra/lib/logger/logger-server'
import { createCategorySchema } from '@/infra/validations/schemas/category'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'

export async function createCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

    const bodyData = await request.json()

    const parsed = createCategorySchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          parsed.error.issues.map((e) => e.message).join('; ')
        )
      )
    }

    const existCategory = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.slug)
    })

    if (existCategory) {
      return left(new ConflictError('Category already exists'))
    }

    const [data] = await db
      .insert(category)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description
      })
      .returning()

    // Default Subcategory
    const [defaultSubCategory] = await db
      .insert(subcategory)
      .values({
        categoryId: data.id,
        name: `${parsed.data.name} Default Subcategory`,
        slug: `${parsed.data.slug}-default`,
        isDefault: true
      })
      .returning()

    return right(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('Unhandled error in createCategory:', error)
    return left(new DatabaseError())
  }
}
