import { updatePost } from '@/core/blog/post/services'
import { publishPost } from '@/core/blog/post/services/publish.service'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const PUT = createApiHandler(updatePost)
export const POST = createApiHandler(publishPost)
