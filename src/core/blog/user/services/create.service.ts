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
import { account, member, user } from '@/infra/db/schemas/auth'
import { category } from '@/infra/db/schemas/blog'
import { auth } from '@/infra/lib/better-auth/auth'
import type { zod } from '@/infra/lib/zod'
import { createUserSchema } from '@/infra/validations/schemas/user'
import { eq, inArray } from 'drizzle-orm'
import { blogRepository } from '../../repository'
import type { IUserDTO } from '../dto'

export async function createUser(
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

    const bodyData = await request.json()
    const parsed = createUserSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, parsed.data.email)
    })
    if (existingUser) {
      return left(new ConflictError('User with this email already exists'))
    }

    const categories = await db.query.category.findMany({
      where: inArray(category.id, parsed.data.categories)
    })

    if (parsed.data.categories.length !== categories.length) {
      // TODO: Show which categories are not found
      return left(new NotFoundError('Some categories not found'))
    }

    const result = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(user)
        .values({
          name: parsed.data.name,
          email: parsed.data.email,
          emailVerified: true,
          role: parsed.data.role
        })
        .returning()

      await tx.insert(account).values({
        accountId: crypto.randomUUID(),
        userId: newUser!.id,
        providerId: 'credential'
      })

      await tx.insert(member).values({
        organizationId: blogData.id,
        userId: newUser.id,
        role: parsed.data.role
      })

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
