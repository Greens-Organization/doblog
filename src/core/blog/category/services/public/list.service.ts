import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
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
    return left(serviceHandleError(error, 'listCategories'))
  }
}
