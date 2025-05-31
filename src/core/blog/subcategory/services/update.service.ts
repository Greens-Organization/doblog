import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { zod } from '@/infra/lib/zod'
import { updateCategorySchema } from '@/infra/validations/schemas/category'
import { logger } from 'better-auth'
import { and, eq, ne } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'
import { extractAndValidatePathParams } from '@/infra/helpers/params'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid category ID')
})

export async function updateSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues
            .map((e: { message: string }) => e.message)
            .join('; ')
        )
      )
    }
    const { id } = parsedParam.data

    const existingSubcategory = await db.query.subcategory.findFirst({
      where: eq(subcategory.id, id),
      columns: {
        categoryId: false
      },
      with: {
        category: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    if (!existingSubcategory) {
      return left(new NotFoundError('Subcategory not found'))
    }

    const bodyData = await request.json()

    const parsedBody = updateCategorySchema().safeParse(bodyData)
    if (!parsedBody.success) {
      return left(
        new ValidationError(
          parsedBody.error.issues
            .map((e: { message: string }) => e.message)
            .join('; ')
        )
      )
    }

    const slugAlreadyUsed = await db.query.subcategory.findFirst({
      where: and(
        ne(subcategory.id, id),
        eq(subcategory.slug, parsedBody.data.slug!)
      )
    })

    if (slugAlreadyUsed) {
      return left(
        new ConflictError('Slug already in use by another subcategory')
      )
    }

    const updatedSubcategoryData = {
      name: parsedBody.data.name,
      slug: parsedBody.data.slug,
      description: parsedBody.data.description
    }

    const [updatedCategory] = await db
      .update(subcategory)
      .set(updatedSubcategoryData)
      .where(eq(subcategory.id, id))
      .returning()
    logger.debug('Updated subcategory data:', updatedCategory)

    return right({ ...updatedCategory, category: existingSubcategory.category })
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('Unhandled error in updateCategory:', error)
    return left(new DatabaseError())
  }
}
