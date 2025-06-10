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
  id: zod.uuid('Invalid UUID format')
})

export async function getCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['read']
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
          (parsedParam.error as zod.ZodError).issues
            .map((e) => e.message)
            .join('; ')
        )
      )
    }
    const { id } = parsedParam.data

    const result = await db.query.category.findFirst({
      where: eq(category.id, id),
      with: {
        subcategory: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    if (!result) {
      return left(new NotFoundError('Category not found'))
    }

    return right(result)
  } catch (error) {
    return left(serviceHandleError(error, 'getCategory'))
  }
}
