import { updateProfile } from '@/core/auth/profile/services'
import { createApiHandler } from '@/infra/helpers/handlers/api'

export const PUT = createApiHandler(updateProfile)
