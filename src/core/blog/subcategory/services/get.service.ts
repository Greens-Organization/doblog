import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { logger } from '@/infra/lib/logger/logger-server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { ISubcategoryDTO } from '../dto'

const pathParamSchema = z.object({
  id: z.string().uuid('Invalid category ID')
})

export async function getSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]

    const parsed = pathParamSchema.safeParse({ id })

    if (!parsed.success) {
      return left(
        new ValidationError(
          parsed.error.errors.map((e) => e.message).join(', ')
        )
      )
    }

    const result = await db.query.subcategory.findFirst({
      where: eq(subcategory.id, parsed.data.id),
      columns: {
        categoryId: false
      },
      with: {
        category: {
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
      return left(new NotFoundError('Subcategory not found'))
    }

    return right(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(new ValidationError('Invalid subcategory ID'))
    }

    logger.error('DB error in get subcategory:', error)
    return left(new DatabaseError())
  }
}
