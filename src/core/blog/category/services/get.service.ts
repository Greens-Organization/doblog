import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { logger } from '@/infra/lib/logger/logger-server'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'

const pathParamSchema = z.object({
  id: z.uuid('Invalid category ID')
})

export async function getCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]

    const parsed = pathParamSchema.safeParse({ id })

    if (!parsed.success) {
      return left(
        new ValidationError(
          parsed.error.issues.map((e) => e.message).join(', ')
        )
      )
    }

    const result = await db.query.category.findFirst({
      where: eq(category.id, parsed.data.id)
    })

    if (!result) {
      return left(new NotFoundError('Category not found'))
    }

    return right(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(new ValidationError('Invalid category ID'))
    }

    logger.error('DB error in getCategory:', error)
    return left(new DatabaseError())
  }
}
