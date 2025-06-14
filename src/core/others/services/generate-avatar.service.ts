import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { serviceHandleError } from '@/core/error/handlers'
import {
  DicebearTypes,
  generateRandomURLAvatar
} from '@/infra/helpers/dicebear'

import { zod } from '@/infra/lib/zod'

const searchParamSchema = zod
  .object({
    type: zod.enum(DicebearTypes, 'Invalid avatar type').optional()
  })
  .partial()

interface ResponseAvatar {
  url: string
  type: DicebearTypes
}

export async function generateAvatarDicebear(
  request: Request
): Promise<AppEither<ResponseAvatar>> {
  try {
    const url = new URL(request.url)
    const searchParams = searchParamSchema.parse({
      type: url.searchParams.get('type') ?? undefined
    })
    const { type } = searchParams

    const avatarURL = generateRandomURLAvatar({ type: type })

    return right({ url: avatarURL, type: type ?? DicebearTypes.glass })
  } catch (error) {
    return left(serviceHandleError(error, 'getCategory'))
  }
}
