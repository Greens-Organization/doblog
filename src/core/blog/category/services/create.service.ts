import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { ensureIsAdmin } from '@/infra/helpers/auth/ensure-is-admin'
import { categorySchema } from '@/infra/validations/schemas'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function createCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    console.log(sessionResult)

    const isAdmin = ensureIsAdmin(sessionResult.value)
    if (isLeft(isAdmin)) return isAdmin

    const bodyData = await request.json()

    const parsed = categorySchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          parsed.error.errors.map((e) => e.message).join(', ')
        )
      )
    }

    const existCategory = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.slug)
    })

    if (existCategory) {
      return left(new ConflictError('Category already exists'))
    }

    const [data] = await db
      .insert(category)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description
      })
      .returning()

    return right(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.errors.map((e) => e.message).join(', '))
      )
    }

    console.error('Unhandled error in createCategory:', error)
    return left(new DatabaseError())
  }
}
