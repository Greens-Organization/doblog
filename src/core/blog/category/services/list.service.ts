import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { UnauthorizedError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { and, count, eq } from 'drizzle-orm'

const searchParamsSchema = zod.object({
  id: zod.uuid().optional(),
  slug: zod.string().optional(),
  name: zod.string().optional(),
  page: zod.coerce.number().optional().default(1),
  per_page: zod.coerce.number().optional().default(25)
})

interface ResponseDTO {
  categories: ICategoryDTO[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export async function listCategories(
  request: Request
): Promise<AppEither<ResponseDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['list']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      id: url.searchParams.get('id') ?? undefined,
      slug: url.searchParams.get('slug') ?? undefined,
      name: url.searchParams.get('name') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      per_page: url.searchParams.get('per_page') ?? undefined
    })

    const page = params.page ?? 1
    const perPage = params.per_page ?? 25
    const offset = (page - 1) * perPage

    const filters = []

    if (params.id) {
      filters.push(eq(category.id, params.id))
    }

    if (params.slug) {
      filters.push(eq(category.slug, params.slug))
    }

    if (params.name) {
      filters.push(eq(category.name, params.name))
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined

    const totalFilters = []
    if (params.id) {
      totalFilters.push(eq(category.id, params.id))
    }
    if (params.slug) {
      totalFilters.push(eq(category.slug, params.slug))
    }
    if (params.name) {
      totalFilters.push(eq(category.name, params.name))
    }
    const totalWhereClause =
      totalFilters.length > 0 ? and(...totalFilters) : undefined

    const totalQuery = await db
      .select({ count: count() })
      .from(category)
      .where(totalWhereClause)

    const total = totalQuery[0].count
    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    const result = await db.query.category.findMany({
      where: whereClause,
      with: {
        subcategory: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      },
      limit: perPage,
      offset: offset
    })

    //TODO: add total quantity of items in each category
    return right({
      categories: result,
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      }
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listCategories'))
  }
}
