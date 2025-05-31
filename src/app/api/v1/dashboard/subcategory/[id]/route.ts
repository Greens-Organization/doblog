import {
  updateSubcategory,
  deleteSubcategory
} from '@/core/blog/subcategory/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const PUT = createApiHandler(updateSubcategory)
export const DELETE = createApiHandler(deleteSubcategory)
