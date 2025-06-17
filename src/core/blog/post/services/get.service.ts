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
import { ensureAuthenticated } from '@/infra/helpers/auth'
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
    const session = await ensureAuthenticated(request)
    if (isLeft(session)) {
      return left(session.value)
    }
    if (!session.value || !session.value.user) {
      return left(new UnauthorizedError('User not found in session'))
    }
    const isAdmin = session.value.user.role === 'admin'

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
      userId: session.value.user.id
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
