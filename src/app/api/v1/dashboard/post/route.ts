import { createPost } from '@/core/blog/post/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const POST = createApiHandler(createPost)
