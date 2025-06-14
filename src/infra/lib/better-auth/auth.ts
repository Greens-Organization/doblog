import { ac, admin, editor } from '@/core/auth/permissions'
import { blogRepository } from '@/core/blog/repository'
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
import { socialProviders } from './providers'

export const auth = betterAuth({
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
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true
    }
  },
  emailAndPassword: {
    enabled: true, // TODO: Add this on env to setup if application use this or socialProviders
    password: {
      hash: makePasswordHasher().hash,
      verify: makePasswordHasher().compare
    },
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  socialProviders: socialProviders[0],
  plugins: [
    nextCookies(),
    organization({
      // organizationCreation: {
      //   disabled: true,
      // },
      ac,
      roles: {
        admin,
        editor
      }
    })
  ],
  user: {
    additionalFields: {
      role: {
        type: 'string'
      }
    }
  }
})
