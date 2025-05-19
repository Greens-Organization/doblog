import { timestamp, uuid } from 'drizzle-orm/pg-core'

export const idPrimaryKey = uuid('id').primaryKey().defaultRandom()
export const createdAt = timestamp('created_at').defaultNow()
export const updatedAt = timestamp('updated_at').$onUpdate(() => new Date())
