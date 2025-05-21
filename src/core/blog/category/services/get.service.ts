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
import { eq } from 'drizzle-orm'

export async function getCategory(
  request: Request
): Promise<AppEither<unknown>> {
  const bodyData = await request.json()

  if (!bodyData.name || !bodyData.slug) {
    return left(new ValidationError('Missing name or slug'))
  }

  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return left(new UnauthorizedError())
  }

  try {
    const existCategory = await db.query.category.findFirst({
      where: eq(category.slug, bodyData.slug)
    })

    if (existCategory) {
      return left(new ConflictError('Category already exists'))
    }

    const data = await db.insert(category).values({
      name: bodyData.name,
      slug: bodyData.slug,
      description: bodyData.description
    })

    return right(data)
  } catch (error) {
    return left(new DatabaseError())
  }
}
