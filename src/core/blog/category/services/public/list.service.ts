import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { DatabaseError, ValidationError } from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { and, eq } from 'drizzle-orm'

const searchParamsSchema = zod.object({
  slug: zod.string().optional(),
  name: zod.string().optional()
})

export async function listCategories(
  request: Request
): Promise<AppEither<Omit<ICategoryDTO, 'id'>[]>> {
  try {
    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      slug: url.searchParams.get('slug') ?? undefined,
      name: url.searchParams.get('name') ?? undefined
    })

    const filters = []

    if (params.slug) {
      filters.push(eq(category.slug, params.slug))
    }

    if (params.name) {
      filters.push(eq(category.name, params.name))
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined

    const result = await db.query.category.findMany({
      where: whereClause,
      columns: {
        id: false
      },
      with: {
        subcategory: {
          columns: {
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    //TODO: add total quantity of items in each category
    return right(result)
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('DB error in getCategory:', error)
    return left(new DatabaseError())
  }
}
