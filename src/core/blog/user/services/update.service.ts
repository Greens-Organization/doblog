import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { user } from '@/infra/db/schemas/auth'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { updateUserSchema } from '@/infra/validations/schemas/user'
import { eq } from 'drizzle-orm'
import { blogRepository } from '../../repository'
import type { IUserDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid user ID')
})

export async function updateUser(
  request: Request
): Promise<
  AppEither<Pick<IUserDTO, 'name' | 'image' | 'email' | 'role'> | null>
> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          user: ['create']
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

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, id)
    })
    if (!existingUser) {
      return left(new NotFoundError('User not found'))
    }

    const bodyData = await request.json()
    const parsed = updateUserSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const result = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .update(user)
        .set({
          name: parsed.data.name,
          email: parsed.data.email,
          role: parsed.data.role
        })
        .returning()

      return newUser
    })

    return right({
      body: {
        email: result.email,
        name: result.name,
        image: result.image,
        role: result.role
      },
      statusCode: 201
    })
  } catch (error) {
    return left(serviceHandleError(error, 'createUser'))
  }
}
