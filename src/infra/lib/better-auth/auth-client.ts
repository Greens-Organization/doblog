import { admin, editor } from '@/core/auth/permissions'
import { UserRole } from '@/core/blog/user/dto'
import {
  inferAdditionalFields,
  organizationClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from './auth'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({
      roles: { [UserRole.ADMIN]: admin, [UserRole.EDITOR]: editor }
    })
  ]
})

export const { signIn, signOut, signUp, useSession, organization } = authClient
