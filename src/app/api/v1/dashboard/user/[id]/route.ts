import { deleteUser, updateUser } from '@/core/blog/user/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

// export const GET = createApiHandler(getSubcategory)
export const PUT = createApiHandler(updateUser)
export const DELETE = createApiHandler(deleteUser)
