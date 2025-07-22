import { ac, admin, editor, owner } from '@/core/auth/permissions'
import { blogRepository } from '@/core/blog/repository'
import { env } from '@/env'
import { makePasswordHasher } from '@/infra/cryptography/password'
import { db } from '@/infra/db'
import {
  account,
  invitation,
  member,
  organization as org,
  session,
  user,
  verification
} from '@/infra/db/schemas/auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { organization } from 'better-auth/plugins'
import {
  sendInvitationEmail,
  sendResetPassword,
  sendVerificationEmail
} from './helpers'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      invitation,
      member,
      organization: org
    }
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await blogRepository.getBlog()
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id
            }
          }
        }
      }
    }
  },
  advanced: {
    database: { generateId: false },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true
    }
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: makePasswordHasher().hash,
      verify: makePasswordHasher().compare
    },
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword,
    requireEmailVerification: true,
    autoSignIn: true
  },
  emailVerification: {
    sendVerificationEmail,
    autoSignInAfterVerification: true
  },
  // socialProviders: socialProviders[0],
  plugins: [
    nextCookies(),
    organization({
      organizationCreation: {
        disabled: true
      },
      ac,
      roles: {
        owner,
        admin,
        editor
      },
      sendInvitationEmail
    })
  ],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        returned: true
      }
    }
  }
})
