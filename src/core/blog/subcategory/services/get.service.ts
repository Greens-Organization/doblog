import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { sql } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid UUID format')
})

export async function getSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          subcategory: ['read']
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
      INNER JOIN category c ON s.category_id = c.id
      LEFT JOIN post p ON s.id = p.subcategory_id
      WHERE s.id = ${id}
      GROUP BY s.id, s.name, s.slug, s.description, s.created_at, s.updated_at, c.id, c.name, c.slug, c.description
    `

    const result = await db.execute(query)

    if (result.rows.length === 0) {
      return left(new NotFoundError('Subcategory not found'))
    }

    const subcategoryData = result.rows[0] as unknown as ISubcategoryDTO

    return right(subcategoryData)
  } catch (error) {
    return left(serviceHandleError(error, 'getSubcategoryPublic'))
  }
}
