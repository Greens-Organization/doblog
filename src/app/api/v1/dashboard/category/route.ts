import {
  createCategory,
  deleteCategory,
  getCategory,
  updateCategory
} from '@/core/blog/category/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const POST = createApiHandler(createCategory)
export const GET = createApiHandler(getCategory)
export const PUT = createApiHandler(updateCategory)
export const DELETE = createApiHandler(deleteCategory)
