import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  ValidationError
} from '@/core/error/errors'
import { makePasswordHasher } from '@/infra/cryptography/password'
import { db } from '@/infra/db'
import { account, member, user } from '@/infra/db/schemas/auth'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { createUserSchema } from '@/infra/validations/schemas/user'
import type { IUserDTO } from '../../user/dto'

export async function createFirstUser(
  request: Request
): Promise<AppEither<Pick<IUserDTO, 'name' | 'email' | 'image' | 'role'>>> {
  try {
    const blogData = await db.query.organization.findFirst()
    const isExistUser = await db.query.user.findFirst()
    if (!blogData || isExistUser) {
      return left(new ConflictError('Configuration already done'))
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

    const [newUser] = await db
      .insert(user)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        emailVerified: true,
        role: 'admin'
      })
      .returning()

    const [accountData] = await db
      .insert(account)
      .values({
        accountId: crypto.randomUUID(),
        userId: newUser!.id,
        providerId: 'credential',
        password: await makePasswordHasher().hash(parsed.data.password)
      })
      .returning()

    await db
      .insert(member)
      .values({
        organizationId: blogData.id,
        userId: newUser.id,
        role: 'admin'
      })
      .returning()

    const { headers, response } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email: parsed.data.email,
        password: parsed.data.password
      }
    })

    return right({
      body: {
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        role: newUser.role
      },
      statusCode: 201,
      headers
    })
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    console.error(error)

    return left(new DatabaseError())
  }
}
