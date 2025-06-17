import { createBlog } from '@/core/blog/setup/services'
import { createApiHandler } from '@/infra/helpers/handlers/api'

export const POST = createApiHandler(createBlog)
