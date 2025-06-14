import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { post } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'
import type { IPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid Post ID')
})

export async function archivePost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['archive']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }
    // TODO: Add a check for the user's permissions to create a post in a specific category

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
    return left(serviceHandleError(error, 'archivePost'))
  }
}
