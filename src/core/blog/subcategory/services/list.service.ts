import type { ISubcategoryDTO } from '@/core/blog/subcategory/dto'
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

const searchParamsSchema = zod.object({
  id: zod.uuid().optional(),
  slug: zod.string().optional(),
  name: zod.string().optional(),
  category_id: zod.uuid().optional(),
  page: zod.coerce.number().min(1).optional().default(1),
  per_page: zod.coerce.number().min(1).optional().default(25)
})

interface ResponseDTO {
  data: ISubcategoryDTO[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export async function listSubcategories(
  request: Request
): Promise<AppEither<ResponseDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value!
    const isAdmin = session.user.role === 'admin'
    const isEditor = session.user.role === 'editor'

    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          subcategory: ['list']
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
      categoryId: url.searchParams.get('category_id') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      per_page: url.searchParams.get('per_page') ?? undefined
    })

    const page = params.page ?? 1
    const perPage = params.per_page ?? 25
    const offset = (page - 1) * perPage

    // Build WHERE conditions dynamically
    const conditions = []
    if (params.id) conditions.push(`s.id = '${sanitizeValue(params.id)}'`)
    if (params.slug)
      conditions.push(`s.slug ILIKE '%${sanitizeValue(params.slug)}%'`)
    if (params.name)
      conditions.push(`s.name ILIKE '%${sanitizeValue(params.name)}%'`)
    if (params.category_id)
      conditions.push(`s.category_id = '${sanitizeValue(params.category_id)}'`)

    let joinClause = 'INNER JOIN category c ON s.category_id = c.id'
    if (isEditor) {
      joinClause += ' INNER JOIN user_to_category utc ON utc.category_id = c.id'
      conditions.push(`utc.user_id = '${session.user.id}'`)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 5. Count total records
    const countQuery = sql`
      SELECT COUNT(DISTINCT s.id)::integer as total
      FROM subcategory s
      ${sql.raw(joinClause)}
      ${sql.raw(whereClause)}
    `
    const totalResult = await db.execute(countQuery)
    const total = Number(totalResult.rows[0]?.total ?? 0)

    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    // 6. Query principal
    const query = sql`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.description,
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        COALESCE(
          COUNT(
            CASE 
              WHEN p.status = 'published'
              THEN 1 
            END
          ), 0
        )::integer as "totalPost",
        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'description', c.description
        ) as category
      FROM subcategory s
      ${sql.raw(joinClause)}
      LEFT JOIN post p ON s.id = p.subcategory_id
      ${sql.raw(whereClause)}
      GROUP BY s.id, s.name, s.slug, s.description, s.created_at, s.updated_at,
              c.id, c.name, c.slug, c.description
      ORDER BY s.created_at DESC
      LIMIT ${perPage}
      OFFSET ${offset}
    `

    const result = await db.execute(query)
    const subcategories = result.rows as unknown as ISubcategoryDTO[]

    return right({
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      },
      data: subcategories
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listSubcategories'))
  }
}
