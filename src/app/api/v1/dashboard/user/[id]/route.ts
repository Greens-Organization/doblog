import {
  changeCategoriesOfUser,
  deleteUser,
  getUser,
  updateUser
} from '@/core/blog/user/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(getUser)
export const PUT = createApiHandler(updateUser)
export const PATCH = createApiHandler(changeCategoriesOfUser)
export const DELETE = createApiHandler(deleteUser)
