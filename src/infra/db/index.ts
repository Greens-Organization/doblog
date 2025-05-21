import { env } from '@/env'
import { schema } from '@/infra/db/schema'
import { drizzle } from 'drizzle-orm/node-postgres'

export const db = drizzle(env.DATABASE_URL, {
  schema,
  logger: env.DRIZZLE_LOGGER
})
