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
    // BetterAuth
    BETTER_AUTH_URL: zod.string().min(1),
    BETTER_AUTH_SECRET: zod.string().min(1).optional(),
    // Database
    DATABASE_URL: zod.string().min(1),
    DRIZZLE_LOGGER: booleanSchema,
    // Redis
    REDIS_URL: zod.string().min(1),
    // Email
    SMTP_HOST: zod.string().min(1),
    SMTP_PORT: zod.coerce.number().min(1).max(65535).default(587).optional(),
    SMTP_USER: zod.string().min(1),
    SMTP_PASS: zod.string().min(1),
    SMTP_FROM: zod.string().min(1),

    // S3
    S3_ENDPOINT: zod.string().min(1),
    S3_PORT: zod.coerce.number().min(1),
    S3_ACCESS_KEY: zod.string().min(1),
    S3_SECRET_KEY: zod.string().min(1),
    S3_BUCKETNAME: zod.string().min(1),
    S3_USESSL: booleanSchema
  },
  client: {},
  experimental__runtimeEnv: {}
})

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
