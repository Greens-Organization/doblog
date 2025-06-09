import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import { NotFoundError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
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
    return left(serviceHandleError(error, 'deleteSubcategory'))
  }
}
