import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { DatabaseError, ValidationError } from '@/core/error/errors'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const searchParamsSchema = z.object({
  slug: z.string().optional(),
  name: z.string().optional()
})

export async function listCategories(
  request: Request
): Promise<AppEither<ICategoryDTO[]>> {
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

    const result = await db.select().from(category).where(whereClause)

    //TODO: add total quantity of items in each category
    return right(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(new ValidationError('Invalid query parameters'))
    }

    console.error('DB error in getCategory:', error)
    return left(new DatabaseError())
  }
}
