import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { serviceHandleError } from '@/core/error/handlers'
import { auth } from '@/infra/lib/better-auth/auth'
import type { IUserDTO } from '../dto'

export async function createUser(
  request: Request
): Promise<AppEither<IUserDTO | null>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          user: ['create']
        }
      }
    })

    console.log('canAccess:', canAccess)

    // const isExistBlog = await db.query.organization.findFirst()
    // if (isExistBlog) {
    //   return left(new ConflictError('Configuration already done'))
    // }

    // const bodyData = await request.json()
    // const parsed = createBlogSchema().safeParse(bodyData)
    // if (!parsed.success) {
    //   return left(
    //     new ValidationError(
    //       (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
    //     )
    //   )
    // }

    // const [data] = await db
    //   .insert(organization)
    //   .values({
    //     name: parsed.data.name,
    //     slug: slug(parsed.data.name),
    //     logo: parsed.data.logo,
    //     description: parsed.data.description
    //   })
    //   .returning()

    return right({ body: null, statusCode: 201 })
  } catch (error) {
    return left(serviceHandleError(error, 'createUser'))
  }
}
