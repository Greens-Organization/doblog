import { createCategory, listCategories } from '@/core/blog/category/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(listCategories)
export const POST = createApiHandler(createCategory)
