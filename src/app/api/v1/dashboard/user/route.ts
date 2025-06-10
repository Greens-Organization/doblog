import { createUser, listUser } from '@/core/blog/user/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(listUser)
export const POST = createApiHandler(createUser)
