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
import { checkUserCategories } from '../../user/services'
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

    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id)
    })

    if (!existingPost) {
      return left(new NotFoundError('Post not found'))
    }

    if (existingPost.status === 'archived') {
      return left(new ConflictError('Post is already archived'))
    }

    // Check if the user has permission to archive posts
    const checkUser = await checkUserCategories({
      userId: session?.user.id!
    })
    if (isLeft(checkUser)) {
      return left(checkUser.value)
    }
    const { categories: userCategories, subcategories: userSubcategories } =
      checkUser.value

    if (
      existingPost?.status === 'published' &&
      !isAdmin &&
      existingPost.authorId !== session!.user.id
    ) {
      return left(
        new UnauthorizedError('You do not have permission to archive this post')
      )
    }

    if (
      existingPost?.status === 'draft' &&
      !isAdmin &&
      !userSubcategories.find(
        (category) => category.id === existingPost.subcategoryId
      )
    ) {
      return left(
        new UnauthorizedError('You do not have permission to archive this post')
      )
    }

    const updatedPost = await db.transaction(async (tx) => {
      const [dataReturn] = await db
        .update(post)
        .set({
          status: 'archived'
        })
        .where(eq(post.id, id))
        .returning()
      return dataReturn
    })

    return right(updatedPost)
  } catch (error) {
    return left(serviceHandleError(error, 'archivePost'))
  }
}
