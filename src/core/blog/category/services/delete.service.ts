import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid category ID')
})

export async function deleteCategory(
  request: Request
): Promise<AppEither<{ message: string; deleted: ICategoryDTO }>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['delete']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues
            .map((e: { message: any }) => e.message)
            .join('; ')
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
    return left(serviceHandleError(error, 'deleteCategory'))
  }
}
