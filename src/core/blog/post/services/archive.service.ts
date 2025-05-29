import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { post } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { AccessHandler } from '@/infra/helpers/handlers/access-handler'
import { extractAndValidatePathParam } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { UserRole } from '../../user/dto'
import type { IPostDTO } from '../dto'

const pathParamSchema = z.object({
  id: z.uuid('Invalid Post ID')
})

export async function archivePost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return sessionResult

    if (
      !AccessHandler.hasAccessByRole(sessionResult.value?.user.role, [
        UserRole.ADMIN,
        UserRole.EDITOR
      ])
    ) {
      return left(
        new UnauthorizedError('Access denied: Admins and Editors only')
      )
    }

    const parsedParam = extractAndValidatePathParam(request, pathParamSchema)
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues.map((e) => e.message).join('; ')
        )
      )
    }

    const { id } = parsedParam.data

    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id)
    })

    if (!existingPost) {
      return left(new NotFoundError('Post not found'))
    }

    if (existingPost.status === 'archived') {
      return left(new ConflictError('Post is already archived'))
    }

    const [updatedPost] = await db
      .update(post)
      .set({
        status: 'archived'
      })
      .where(eq(post.id, id))
      .returning()

    return right(updatedPost)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    console.error(error)
    logger.error('Unhandled error in archivePost:', error)
    return left(new DatabaseError())
  }
}
