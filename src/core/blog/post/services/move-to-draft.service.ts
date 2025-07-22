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
import { checkIsAdmin, ensureAuthenticated } from '@/infra/helpers/auth'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'
import { checkUserCategories } from '../../user/services'
import type { IPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid Post ID')
})

export async function movePostToDraft(
  request: Request
): Promise<AppEither<IPostDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = checkIsAdmin(session)

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

    // Extract and validate path parameters
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

    // Check if the user has permission to move posts to draft
    const checkUser = await checkUserCategories({
      userId: session?.user.id!
    })
    if (isLeft(checkUser)) {
      return left(checkUser.value)
    }
    const { categories: userCategories, subcategories: userSubcategories } =
      checkUser.value

    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id)
    })

    if (
      !userSubcategories.find((c) => c.id === existingPost?.subcategoryId) &&
      !isAdmin
    ) {
      return left(
        new UnauthorizedError(
          'You do not have permission to move this post to draft'
        )
      )
    }

    if (!existingPost) {
      return left(new NotFoundError('Post not found'))
    }

    if (existingPost.status === 'draft') {
      return left(new ConflictError('Post is already a draft'))
    }

    const updatedPost = await db.transaction(async (tx) => {
      const [data] = await tx
        .update(post)
        .set({
          status: 'draft',
          publishedAt: null
        })
        .where(eq(post.id, id))
        .returning()
      return data
    })

    return right(updatedPost)
  } catch (error) {
    return left(serviceHandleError(error, 'movePostToDraft'))
  }
}
