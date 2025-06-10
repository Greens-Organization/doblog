import { getCategoryPublic } from '@/core/blog/category/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(getCategoryPublic)
