import { generateAvatarDicebear } from '@/core/others/services'
import { createApiHandler } from '@/infra/helpers/handlers/api'

export const POST = createApiHandler(generateAvatarDicebear)
