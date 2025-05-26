import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { DatabaseError, ValidationError } from '@/core/error/errors'
import { db } from '@/infra/db'
import { category, subcategory } from '@/infra/db/schemas/blog'
import { logger } from '@/infra/lib/logger/logger-server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import type { ISubcategoryDTO } from '../dto'

const searchParamsSchema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  category_slug: z.string().optional()
})

export async function listSubcategories(
  request: Request
): Promise<AppEither<ISubcategoryDTO[]>> {
  try {
    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      slug: url.searchParams.get('slug') ?? undefined,
      name: url.searchParams.get('name') ?? undefined,
      category_slug: url.searchParams.get('category_slug') ?? undefined
    })

    const filters = []

    if (params.slug) {
      filters.push(eq(subcategory.slug, params.slug))
    }

    if (params.name) {
      filters.push(eq(subcategory.name, params.name))
    }

    if (params.category_slug) {
      const categoryFilter = await db.query.category.findFirst({
        where: eq(category.slug, params.category_slug)
      })
      if (!categoryFilter) {
        return left(new ValidationError('Category slug not found'))
      }
      filters.push(eq(subcategory.categoryId, categoryFilter.id))
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined

    // const result = await db.select().from(subcategory).where(whereClause)
    const result = await db.query.subcategory.findMany({
      where: whereClause,
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

    //TODO: add total quantity of items in each category
    return right(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(new ValidationError('Invalid query parameters'))
    }

    logger.error('DB error in listSubcategories:', error)
    return left(new DatabaseError())
  }
}
