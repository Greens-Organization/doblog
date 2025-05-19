import { account } from './schemas/auth/account'
import { session } from './schemas/auth/session'
import { user } from './schemas/auth/user'
import { verification } from './schemas/auth/verification'

export const schemas = {
  // better auth
  ...user,
  ...session,
  ...account,
  ...verification
}
