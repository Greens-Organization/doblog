import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  DatabaseError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import { organization } from '@/infra/db/schemas/auth'
import { slug } from '@/infra/helpers/string'
import { zod } from '@/infra/lib/zod'
import { createBlogSchema } from '@/infra/validations/schemas/blog'
import { logger } from 'better-auth'
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

    const [data] = await db
      .insert(organization)
      .values({
        name: parsed.data.name,
        slug: slug(parsed.data.name),
        logo: parsed.data.logo,
        description: parsed.data.description
      })
      .returning()

    return right({ body: data, statusCode: 201 })
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('Unhandled error in updateCategory:', error)
    return left(new DatabaseError())
  }
}
