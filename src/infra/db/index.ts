import { env, isDevelopment } from '@/env'
import * as schema from '@/infra/db/schema'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'

const clientNeon = neon(env.DATABASE_URL)

const drizzle = {
  neon: drizzleNeon(clientNeon, {
    schema,
    logger: env.DRIZZLE_LOGGER
  }),
  default: drizzlePostgres(env.DATABASE_URL, {
    schema,
    logger: env.DRIZZLE_LOGGER
  })
}

export const db = isDevelopment ? drizzle.default : drizzle.neon
