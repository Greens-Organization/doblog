import { getBlog } from '@/core/blog/services'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const GET = createApiHandler(getBlog)
