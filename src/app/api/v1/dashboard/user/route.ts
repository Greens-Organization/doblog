import { createUser } from '@/core/blog/user/services/create.service'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const POST = createApiHandler(createUser)
