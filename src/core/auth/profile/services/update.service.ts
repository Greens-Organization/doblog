import { blogRepository } from '@/core/blog/repository'
import type { IUserDTO } from '@/core/blog/user/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { user } from '@/infra/db/schemas/auth'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { auth } from '@/infra/lib/better-auth/auth'
import type { zod } from '@/infra/lib/zod'
import { updateProfileSchema } from '@/infra/validations/schemas/profile'
import { eq } from 'drizzle-orm'

export async function updateProfile(
  request: Request
): Promise<
  AppEither<Pick<IUserDTO, 'name' | 'image' | 'email' | 'role'> | null>
> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          profile: ['update']
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

    const authSession = await ensureAuthenticated(request)
    if (isLeft(authSession)) {
      return authSession
    }
    const session = authSession.value
    const id = session?.user.id

    if (!id) {
      return left(new UnauthorizedError('User not authenticated'))
    }

    const bodyData = await request.json()
    const parsed = updateProfileSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const result = await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(user)
        .set({
          name: parsed.data.name,
          email: parsed.data.email,
          image: parsed.data.image
        })
        .where(eq(user.id, id))
        .returning()

      return updatedUser
    })

    return right({
      body: result,
      statusCode: 200
    })
  } catch (error) {
    return left(serviceHandleError(error, 'updateUser'))
  }
}
