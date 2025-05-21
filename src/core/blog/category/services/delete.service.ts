import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { auth } from '@/infra/lib/better-auth/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { ICategoryDTO } from '../dto/category.schema'

const pathParamSchema = z.object({
  id: z.string().uuid('Invalid category ID')
})

export async function deleteCategory(
  request: Request
): Promise<AppEither<{ message: string; deleted: ICategoryDTO }>> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return left(new UnauthorizedError())
    }

    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]

    const parsedParam = pathParamSchema.safeParse({ id })
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.errors.map((e) => e.message).join(', ')
        )
      )
    }

    const existingCategory = await db.query.category.findFirst({
      where: eq(category.id, parsedParam.data.id)
    })

    if (!existingCategory) {
      return left(new NotFoundError('Category not found'))
    }

    const [deletedCategory] = await db
      .delete(category)
      .where(eq(category.id, parsedParam.data.id))
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
