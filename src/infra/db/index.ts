import { env } from '@/env'
import * as schema from '@/infra/db/schema'
import { neon } from '@neondatabase/serverless'
import { type NeonHttpDatabase, drizzle } from 'drizzle-orm/neon-http'

const client = neon(env.DATABASE_URL)

export const db: NeonHttpDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: env.DRIZZLE_LOGGER
})
