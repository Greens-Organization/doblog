import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { user, userToCategory } from '@/infra/db/schemas/auth'
import { post } from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { and, eq } from 'drizzle-orm'
import { blogRepository } from '../../repository'
import type { IUserDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid user ID')
})

export async function deleteUser(
  request: Request
): Promise<
  AppEither<Pick<IUserDTO, 'name' | 'image' | 'email' | 'role'> | null>
> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          user: ['delete']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const authSession = await ensureAuthenticated(request)
    if (isLeft(authSession)) {
      return authSession
    }
    const session = authSession.value
    const currentUser = session?.user.id

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

    if (currentUser === id) {
      return left(new UnauthorizedError("you can't delete yourself"))
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, id)
    })
    if (!existingUser) {
      return left(new NotFoundError('User not found'))
    }

    // Check if the user is an owner
    if (existingUser.role === 'owner') {
      return left(new ValidationError('Cannot delete the owner user'))
    }

    if (existingUser.role === 'admin' && session?.user.role !== 'owner') {
      return left(new ValidationError('Cannot delete an admin user'))
    }

    // if (existingUser.role === 'admin') {
    //   const admins = await db.query.user.findMany({
    //     where: eq(user.role, 'admin')
    //   })
    //   if (admins.length <= 1) {
    //     return left(new ValidationError('At least one admin is required'))
    //   }
    // }

    const anonymousUser = await db.query.user.findFirst({
      where: and(eq(user.email, 'anonymous'))
    })
    if (!anonymousUser) {
      return left(new NotFoundError('Anonymous user not found'))
    }
    if (id === anonymousUser.id) {
      return left(new ValidationError('Cannot delete Anonymous user'))
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(post)
        .set({ authorId: anonymousUser.id })
        .where(eq(post.authorId, id))

      await tx
        .delete(userToCategory)
        .where(eq(userToCategory.userId, id))
        .returning()

      const [{ id: _, ...deletedUser }] = await tx
        .delete(user)
        .where(eq(user.id, id))
        .returning()
      return deletedUser
    })

    return right({
      body: {
        email: result.email,
        name: result.name,
        image: result.image,
        role: result.role
      },
      statusCode: 200
    })
  } catch (error) {
    return left(serviceHandleError(error, 'updateUser'))
  }
}
