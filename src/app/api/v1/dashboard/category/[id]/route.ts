import { deleteCategory, updateCategory } from '@/core/blog/category/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const PUT = createApiHandler(updateCategory)
export const DELETE = createApiHandler(deleteCategory)
