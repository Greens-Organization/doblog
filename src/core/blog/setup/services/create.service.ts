import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { ConflictError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { organization } from '@/infra/db/schemas/auth'
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
    return left(serviceHandleError(error, 'createBlog'))
  }
}
