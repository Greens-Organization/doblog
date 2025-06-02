import { createSubcategory } from '@/core/blog/subcategory/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const POST = createApiHandler(createSubcategory)
