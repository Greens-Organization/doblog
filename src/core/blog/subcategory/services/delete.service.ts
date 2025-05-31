import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid subcategory ID')
})

export async function deleteSubcategory(
  request: Request
): Promise<AppEither<{ message: string; deleted: ISubcategoryDTO }>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

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

    const [{ categoryId, ...deletedSubcategory }] = await db
      .delete(subcategory)
      .where(eq(subcategory.id, id))
      .returning()

    return right({
      message: 'Subcategory successfully deleted',
      deleted: { ...deletedSubcategory, category: existingSubcategory.category }
    })
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('Unhandled error in delete subcategory:', error)
    return left(new DatabaseError())
  }
}
