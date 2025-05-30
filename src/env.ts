import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod/v4'

const booleanSchema = z.stringbool({
  truthy: ['1', 'true'],
  falsy: ['0', 'false']
})

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['production', 'development', 'test'])
      .default('development'),
    DEBUG: booleanSchema,
    ADMIN_EMAIL: z.email().optional().default('admin@grngroup.net'),
    ADMIN_PASSWORD: z.string().optional().default('admin123'),
    // BetterAuth
    BETTER_AUTH_URL: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    // Database
    DATABASE_URL: z.string().min(1),
    DRIZZLE_LOGGER: booleanSchema,
    // Github
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    // Google
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional()
  },
  client: {},
  experimental__runtimeEnv: {}
})

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
