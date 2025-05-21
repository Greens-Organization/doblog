import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { auth } from '@/infra/lib/better-auth/auth'
import { categorySchema } from '@/infra/validations/schemas'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { ICategoryDTO } from '../dto/category.schema'

export async function createCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return left(new UnauthorizedError())
    }

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
