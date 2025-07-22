import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { checkIsEditor, ensureAuthenticated } from '@/infra/helpers/auth'
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
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value!
    const isEditor = checkIsEditor(session)

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

    let joinClause = 'INNER JOIN category c ON s.category_id = c.id'
    let whereClause = `WHERE s.id = '${id}'`
    if (isEditor) {
      joinClause += ' INNER JOIN user_to_category utc ON utc.category_id = c.id'
      whereClause += ` AND utc.user_id = '${session.user.id}'`
    }

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
      GROUP BY s.id, s.name, s.slug, s.description, s.created_at, s.updated_at, c.id, c.name, c.slug, c.description
    `

    const result = await db.execute(query)
    const subcategoryData = result.rows[0] as unknown as ISubcategoryDTO

    if (!subcategoryData) {
      return left(new NotFoundError('Subcategory not found'))
    }

    return right(subcategoryData)
  } catch (error) {
    return left(serviceHandleError(error, 'getSubcategory'))
  }
}
