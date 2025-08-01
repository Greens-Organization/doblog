import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
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
import type { IGetPostDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid UUID format')
})

export async function getPost(
  request: Request
): Promise<AppEither<IGetPostDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = checkIsAdmin(session)

    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['read']
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

    // Check if the user has categories
    const checkUser = await checkUserCategories({
      userId: session!.user.id
    })
    if (isLeft(checkUser)) {
      return left(checkUser.value)
    }
    const { categories: userCategories } = checkUser.value

    // Fetch posts with pagination
    const postData = await db.query.post.findFirst({
      where: eq(post.id, id),
      with: {
        author: {
          columns: {
            id: true,
            role: true,
            name: true,
            image: true
          }
        },
        subcategory: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true
          },
          with: {
            category: {
              columns: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!postData) {
      return left(new NotFoundError('Post not found or does not exist'))
    }

    const canAccessPost = isAdmin
      ? true
      : userCategories.find((c) => c.id === postData?.subcategory.category.id)

    if (!canAccessPost) {
      return left(
        new UnauthorizedError('You do not have permission to access this post')
      )
    }

    return right(postData)
  } catch (error) {
    return left(serviceHandleError(error, 'listPostsByCategoryOrSubcategory'))
  }
}
