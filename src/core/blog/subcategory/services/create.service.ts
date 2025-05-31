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
import { zod } from '@/infra/lib/zod'
import { createSubcategorySchema } from '@/infra/validations/schemas/subcategory'
import { eq } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'

export async function createSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

    const bodyData = await request.json()

    const parsed = createSubcategorySchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const categoryData = await db.query.category.findFirst({
      where: eq(category.id, parsed.data.categorySlug)
    })

    if (!categoryData) {
      return left(new ValidationError('Category not found'))
    }

    const existSubcategory = await db.query.subcategory.findFirst({
      where: eq(subcategory.slug, parsed.data.slug)
    })

    if (existSubcategory) {
      return left(new ConflictError('Subcategory already exists'))
    }

    const [{ categoryId, ...data }] = await db
      .insert(subcategory)
      .values({
        categoryId: categoryData.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description
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
