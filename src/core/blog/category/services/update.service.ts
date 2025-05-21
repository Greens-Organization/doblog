import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { categorySchema } from '@/infra/validations/schemas'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

const pathParamSchema = z.object({
  id: z.string().uuid('Invalid category ID')
})

export async function updateCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

    const parsedParam = extractAndValidatePathParam(request, pathParamSchema)
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.errors.map((e) => e.message).join(', ')
        )
      )
    }
    const { id } = parsedParam.data

    const bodyData = await request.json()

    const parsedBody = categorySchema().safeParse(bodyData)
    if (!parsedBody.success) {
      return left(
        new ValidationError(
          parsedBody.error.errors.map((e) => e.message).join(', ')
        )
      )
    }

    const existingCategory = await db.query.category.findFirst({
      where: eq(category.id, id)
    })

    if (!existingCategory) {
      return left(new NotFoundError('Category not found'))
    }

    const slugAlreadyUsed = await db.query.category.findFirst({
      where: and(ne(category.id, id), eq(category.slug, parsedBody.data.slug))
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
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.errors.map((e) => e.message).join(', '))
      )
    }

    console.error('Unhandled error in updateCategory:', error)
    return left(new DatabaseError())
  }
}
