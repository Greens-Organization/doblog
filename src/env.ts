import { createEnv } from '@t3-oss/env-nextjs'
import { zod } from './infra/lib/zod'

const booleanSchema = zod.stringbool({
  truthy: ['1', 'true'],
  falsy: ['0', 'false']
})

export const env = createEnv({
  server: {
    NODE_ENV: zod
      .enum(['production', 'development', 'test'])
      .default('development'),
    DEBUG: booleanSchema,
    ADMIN_EMAIL: zod.email().optional().default('admin@grngroup.net'),
    ADMIN_PASSWORD: zod.string().optional().default('admin123'),
    // BetterAuth
    BETTER_AUTH_URL: zod.string().min(1).optional(),
    BETTER_AUTH_SECRET: zod.string().min(1).optional(),
    // Database
    DATABASE_URL: zod.string().min(1),
    DRIZZLE_LOGGER: booleanSchema,
    // Github
    GITHUB_CLIENT_ID: zod.string().optional(),
    GITHUB_CLIENT_SECRET: zod.string().optional(),
    // Google
    GOOGLE_CLIENT_ID: zod.string().optional(),
    GOOGLE_CLIENT_SECRET: zod.string().optional()
  },
  client: {},
  experimental__runtimeEnv: {}
})

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
