import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { zod } from '@/infra/lib/zod'
import { updateCategorySchema } from '@/infra/validations/schemas/category'
import { and, eq, ne } from 'drizzle-orm'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid category ID')
})

export async function updateCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
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

    const existingCategory = await db.query.category.findFirst({
      where: eq(category.id, id)
    })

    if (!existingCategory) {
      return left(new NotFoundError('Category not found'))
    }

    const bodyData = await request.json()

    const parsedBody = updateCategorySchema().safeParse(bodyData)
    if (!parsedBody.success) {
      return left(
        new ValidationError(
          (parsedBody.error as zod.ZodError).issues
            .map((e) => e.message)
            .join('; ')
        )
      )
    }

    const slugAlreadyUsed = await db.query.category.findFirst({
      where: and(ne(category.id, id), eq(category.slug, parsedBody.data.slug!))
    })

    if (slugAlreadyUsed) {
      return left(new ConflictError('Slug already in use by another category'))
    }

    const [updatedCategory] = await db
      .update(category)
      .set({
        name: parsedBody.data.name,
        slug: parsedBody.data.slug,
        description: parsedBody.data.description
      })
      .where(eq(category.id, id))
      .returning()

    return right(updatedCategory)
  } catch (error) {
    return left(serviceHandleError(error, 'updateCategory'))
  }
}
