import { createThumbnail } from '@/core/blog/upload/thumbnail/services'
import { createApiHandler } from '@/infra/helpers/handlers/api'

export const POST = createApiHandler(createThumbnail)
