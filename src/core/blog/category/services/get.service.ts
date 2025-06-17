import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { UnauthorizedError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { PostStatus } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'

import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { sql } from 'drizzle-orm'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid UUID format')
})

const searchParamSchema = zod
  .object({
    status: zod.enum(PostStatus)
  })
  .partial()

export async function getCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['read']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
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
    const { id } = parsedParam.data

    const url = new URL(request.url)
    const searchParams = searchParamSchema.parse({
      status: url.searchParams.get('status') ?? undefined
    })

    const { status } = searchParams

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
              WHEN ${status ? sql`p.status = ${status}` : sql`p.status = 'published'`}
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
      LEFT JOIN subcategory s ON c.id = s.category_id
      LEFT JOIN post p ON s.id = p.subcategory_id
      WHERE c.id = ${id}
      GROUP BY c.id, c.name, c.slug, c.description, c.created_at, c.updated_at
    `

    const result = await db.execute(query)

    const categoryData = result.rows[0] as unknown as ICategoryDTO

    return right(categoryData)
  } catch (error) {
    return left(serviceHandleError(error, 'getCategory'))
  }
}
