import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
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
import { updateCategorySchema } from '@/infra/validations/schemas/category'
import { and, eq, ne } from 'drizzle-orm'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid category ID')
})

export async function updateCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['update']
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

    if (parsedBody.data.slug !== existingCategory.slug) {
      const slugAlreadyUsed = await db.query.category.findFirst({
        where: and(
          ne(category.id, id),
          eq(category.slug, parsedBody.data.slug!)
        )
      })

      if (slugAlreadyUsed) {
        return left(
          new ConflictError('Slug already in use by another category')
        )
      }
    }

    const categoryData = await db.transaction(async (tx) => {
      const [updatedCategory] = await tx
        .update(category)
        .set({
          name: parsedBody.data.name,
          slug: parsedBody.data.slug,
          description: parsedBody.data.description
        })
        .where(eq(category.id, id))
        .returning()

      return updatedCategory
    })

    return right(categoryData)
  } catch (error) {
    return left(serviceHandleError(error, 'updateCategory'))
  }
}
