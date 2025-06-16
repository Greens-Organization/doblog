import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { post } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'
import type { IPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid Post ID')
})

export async function publishPost(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['moveToDraft']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = session!.user.role === 'admin'

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

    // Check if the post exists
    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id)
    })

    if (!existingPost) {
      return left(new NotFoundError('Post not found'))
    }

    if (existingPost.authorId !== session!.user.id && !isAdmin) {
      return left(
        new UnauthorizedError('You do not have permission to publish this post')
      )
    }

    if (existingPost.status === 'published') {
      return left(new ConflictError('Post is already published'))
    }

    if (existingPost.status === 'archived') {
      return left(new ConflictError('Unable to publish an archived post'))
    }

    const updatedPost = await db.transaction(async (tx) => {
      const [dataReturn] = await tx
        .update(post)
        .set({
          status: 'published',
          publishedAt: new Date()
        })
        .where(eq(post.id, id))
        .returning()

      return dataReturn
    })

    return right(updatedPost)
  } catch (error) {
    return left(serviceHandleError(error, 'publishPost'))
  }
}
