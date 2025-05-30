import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import type { DPost } from '@/infra/db/schemas/blog'
import { post } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { AccessHandler } from '@/infra/helpers/handlers/access-handler'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { UserRole } from '../../user/dto'

const pathParamSchema = z.object({
  id: z.uuid('Invalid Post slug')
})

export async function getPostBySlug(
  request: Request
): Promise<AppEither<DPost>> {
  try {
    const parsedParam = extractAndValidatePathParam(request, pathParamSchema)
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues.map((e) => e.message).join('; ')
        )
      )
    }
    const { id: slug } = parsedParam.data

    // Check session (if exists)
    const sessionResult = await ensureAuthenticated(request)
    let canViewAnyStatus = false

    if (!isLeft(sessionResult) && sessionResult.value) {
      const role = sessionResult.value.user.role
      canViewAnyStatus = AccessHandler.hasAccessByRole(role, [
        UserRole.ADMIN,
        UserRole.EDITOR
      ])
    }

    const whereClause = canViewAnyStatus
      ? eq(post.slug, slug)
      : eq(post.status, 'published')

    const foundPost = await db.query.post.findFirst({
      where: whereClause
    })

    if (!foundPost) {
      return left(new NotFoundError('Post not found'))
    }

    return right(foundPost)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('DB error in getPostBySlug:', error)
    return left(new DatabaseError())
  }
}
