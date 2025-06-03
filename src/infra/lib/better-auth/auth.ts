import { makePasswordHasher } from '@/infra/cryptography/password'
import { db } from '@/infra/db'
import { account, session, user, verification } from '@/infra/db/schemas/auth'
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
      verification
    }
  }),
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
      organizationCreation: {
        disabled: true
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
