import { env, isDevelopment } from '@/env';
import * as schema from '@/infra/db/schema';
import { neon } from '@neondatabase/serverless';
import { type NeonHttpDatabase, drizzle } from 'drizzle-orm/neon-http';

const clientNeon = neon(env.DATABASE_URL)

export const db: NeonHttpDatabase<typeof schema> = drizzle(isDevelopment?clientNeon: env.DATABASE_URL, {
  schema,
  logger: env.DRIZZLE_LOGGER
})
