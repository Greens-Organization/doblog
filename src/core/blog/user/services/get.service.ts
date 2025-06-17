import type { IUserDTO } from '@/core/blog/user/dto'
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
import { blogRepository } from '../../repository'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid user ID')
})

export async function getUser(request: Request): Promise<AppEither<IUserDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          user: ['read']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const blogData = await blogRepository.getBlog()
    if (!blogData) {
      return left(new NotFoundError('Blog not found'))
    }

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues
            .map((e: { message: string }) => e.message)
            .join('; ')
        )
      )
    }
    const { id } = parsedParam.data

    const query = sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.email_verified as "emailVerified",
        u.image,
        u.role,
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        COALESCE(
          (SELECT COUNT(*)::integer 
           FROM post p 
           WHERE p.author_id = u.id), 0
        ) as "totalPosts",
        COALESCE(
          (SELECT COUNT(*)::integer 
           FROM post p 
           WHERE p.author_id = u.id AND p.status = 'published'), 0
        ) as "totalPostPublished",
        COALESCE(
          (SELECT COUNT(*)::integer 
           FROM post p 
           WHERE p.author_id = u.id AND p.status = 'draft'), 0
        ) as "totalPostDraft",
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'description', c.description
            )
          )
          FROM user_to_category uc2
          JOIN category c ON c.id = uc2.category_id
          WHERE uc2.user_id = u.id), '[]'::json
        ) as categories
      FROM "user" u
      WHERE u.id = ${id}
      GROUP BY u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at, u.updated_at
      LIMIT 1
    `

    const result = await db.execute(query)
    const user = result.rows[0] as unknown as IUserDTO | undefined

    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    return right(user)
  } catch (error) {
    return left(serviceHandleError(error, 'listUser'))
  }
}
