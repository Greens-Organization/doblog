import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import { UnauthorizedError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { sanitizeValue } from '@/infra/helpers/sanitize'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { sql } from 'drizzle-orm'
import { buildCategoryQueryParts } from './helpers/build-category-query'

const searchParamsSchema = zod.object({
  id: zod.uuid().optional(),
  slug: zod.string().optional(),
  name: zod.string().optional(),
  page: zod.coerce.number().min(1).optional().default(1),
  per_page: zod.coerce.number().min(1).optional().default(25)
})

interface ResponseDTO {
  data: ICategoryDTO[]
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
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value!
    const isAdmin = session.user.role === 'admin'

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

    // Build WHERE conditions dynamically
    const conditions = []
    if (params.id) conditions.push(`c.id = '${sanitizeValue(params.id)}'`)
    if (params.slug)
      conditions.push(`c.slug ILIKE '%${sanitizeValue(params.slug)}%'`)
    if (params.name)
      conditions.push(`c.name ILIKE '%${sanitizeValue(params.name)}%'`)

    const { joinClause, whereClause } = buildCategoryQueryParts({
      isAdmin,
      userId: session.user.id,
      conditions
    })

    // Count total records
    const countQuery = sql`
    SELECT COUNT(DISTINCT c.id)::integer as total
    FROM category c
    ${sql.raw(joinClause)}
    ${sql.raw(whereClause)}
  `
    const totalResult = await db.execute(countQuery)
    const total = totalResult.rows[0].total as number

    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    // Main query with pagination
    const query = sql`
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.created_at as "createdAt",
      c.updated_at as "updatedAt",
      COALESCE(
        COUNT(
          CASE 
            WHEN p.status = 'published'
            THEN 1 
          END
        ), 0
      )::integer as "totalPost",
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'slug', s.slug,
            'description', s.description
          )
        ) FILTER (WHERE s.id IS NOT NULL), 
        '[]'::json
      ) as subcategory
    FROM category c
    ${sql.raw(joinClause)}
    LEFT JOIN subcategory s ON c.id = s.category_id
    LEFT JOIN post p ON s.id = p.subcategory_id
    ${sql.raw(whereClause)}
    GROUP BY c.id, c.name, c.slug, c.description, c.created_at, c.updated_at
    ORDER BY c.created_at DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `

    const result = await db.execute(query)
    const categories = result.rows as unknown as ICategoryDTO[]

    return right({
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      },
      data: categories
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listCategories'))
  }
}
