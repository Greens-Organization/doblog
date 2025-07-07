import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import { ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { env } from '@/env'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { client } from '@/infra/lib/minio'
import type { zod } from '@/infra/lib/zod'
import { createThumbnailSchema } from '@/infra/validations/schemas/upload/thumbnail'
import type { ICreateThumbnailDTO } from '../dto'

export async function createThumbnail(
  request: Request
): Promise<AppEither<ICreateThumbnailDTO>> {
  try {
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)

    const bodyData = await request.json()

    const parsed = createThumbnailSchema().safeParse(bodyData)

    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('| ')
        )
      )
    }

    const fileName = `${parsed.data.name}.${parsed.data.type}`

    const url = await client.presignedPutObject(
      env.S3_BUCKETNAME,
      fileName,
      2 * 60
    )

    const SSL = env.S3_USESSL ? 'https://' : 'http://'

    const publicURL = [
      SSL,
      env.S3_ENDPOINT,
      env.S3_PORT ? `:${env.S3_PORT}` : '',
      `/${env.S3_BUCKETNAME}`,
      `/${fileName}`
    ].join('')

    return right({
      body: { public_url: publicURL, url },
      statusCode: 201
    })
  } catch (error) {
    return left(serviceHandleError(error, 'createThumbnail'))
  }
}
