import { createPost } from '@/core/blog/post/services'
import { listPosts } from '@/core/blog/post/services/list.service'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const POST = createApiHandler(createPost)
export const GET = createApiHandler(listPosts)
