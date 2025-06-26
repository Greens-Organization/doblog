import { admin, editor } from '@/core/auth/permissions'
import { UserRole } from '@/core/blog/user/dto'
import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      roles: { [UserRole.ADMIN]: admin, [UserRole.EDITOR]: editor }
    })
  ]
})

export const { signIn, signOut, signUp, useSession, organization } = authClient
