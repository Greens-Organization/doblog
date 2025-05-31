import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../../dto'

const pathParamSchema = zod.object({
  slug: zod.string().min(1, 'Slug must be at least 1 character')
})

export async function getSubcategory(
  request: Request
): Promise<AppEither<Omit<ISubcategoryDTO, 'id'>>> {
  try {
    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'slug'
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
    const { slug } = parsedParam.data

    const result = await db.query.subcategory.findFirst({
      where: eq(subcategory.slug, slug),
      columns: {
        id: false,
        categoryId: false,
        isDefault: false
      },
      with: {
        category: {
          columns: {
            id: false,
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
    if (error instanceof zod.ZodError) {
      return left(new ValidationError('Invalid subcategory ID'))
    }

    logger.error('DB error in get subcategory:', error)
    return left(new DatabaseError())
  }
}
