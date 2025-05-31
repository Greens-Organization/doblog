import { getPostBySlug } from '@/core/blog/post/services/public/get.service'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(getPostBySlug)
