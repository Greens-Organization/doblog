import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { ICategoryDTO } from '../dto/category.schema'
import { ensureAuthenticated } from '@/infra/helpers/auth'

const pathParamSchema = z.object({
  id: z.string().uuid('Invalid category ID')
})

export async function deleteCategory(
  request: Request
): Promise<AppEither<{ message: string; deleted: ICategoryDTO }>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const parsedParam = extractAndValidatePathParam(request, pathParamSchema)
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.errors.map((e) => e.message).join(', ')
        )
      )
    }
    const { id } = parsedParam.data

    const existingCategory = await db.query.category.findFirst({
      where: eq(category.id, id)
    })

    if (!existingCategory) {
      return left(new NotFoundError('Category not found'))
    }

    const [deletedCategory] = await db
      .delete(category)
      .where(eq(category.id, id))
      .returning()

    return right({
      message: 'Category successfully deleted',
      deleted: deletedCategory
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.errors.map((e) => e.message).join(', '))
      )
    }

    console.error('Unhandled error in deleteCategory:', error)
    return left(new DatabaseError())
  }
}
