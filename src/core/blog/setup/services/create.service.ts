import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { ConflictError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { makePasswordHasher } from '@/infra/cryptography/password'
import { db } from '@/infra/db'
import { account, member, organization, user } from '@/infra/db/schemas/auth'
import { generateRandomURLAvatar } from '@/infra/helpers/dicebear'
import { generateUUID } from '@/infra/helpers/generate'
import { slug } from '@/infra/helpers/string'
import type { zod } from '@/infra/lib/zod'
import { createBlogSchema } from '@/infra/validations/schemas/blog'
import type { IBlogDTO } from '../../dto'

export async function createBlog(
  request: Request
): Promise<AppEither<IBlogDTO>> {
  try {
    const isExistBlog = await db.query.organization.findFirst()
    if (isExistBlog) {
      return left(new ConflictError('Configuration already done'))
    }

    const bodyData = await request.json()
    const parsed = createBlogSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const [data] = await db.transaction(async (tx) => {
      const [blogData] = await tx
        .insert(organization)
        .values({
          name: parsed.data.name,
          slug: slug(parsed.data.name),
          logo: parsed.data.logo ?? generateRandomURLAvatar(),
          description: parsed.data.description
        })
        .returning()

      const [createdAnonymousUser] = await tx
        .insert(user)
        .values({
          name: 'Anonymous',
          email: 'anonymous',
          emailVerified: true,
          role: 'editor',
          image: generateRandomURLAvatar()
        })
        .returning()

      await tx.insert(account).values({
        accountId: generateUUID(),
        userId: createdAnonymousUser!.id,
        providerId: 'credential',
        password: await makePasswordHasher().hash(generateUUID())
      })

      await tx.insert(member).values({
        organizationId: blogData.id,
        userId: createdAnonymousUser.id,
        role: 'editor'
      })
      return [blogData]
    })

    return right({ body: data, statusCode: 201 })
  } catch (error) {
    return left(serviceHandleError(error, 'createBlog'))
  }
}
