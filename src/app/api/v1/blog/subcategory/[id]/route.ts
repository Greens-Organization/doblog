import {
  deleteSubcategory,
  getSubcategory,
  updateSubcategory
} from '@/core/blog/subcategory/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(getSubcategory)
export const PUT = createApiHandler(updateSubcategory)
export const DELETE = createApiHandler(deleteSubcategory)
