import { text, timestamp } from 'drizzle-orm/pg-core'

export const idPrimaryKey = text('id')
  .notNull()
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID())
export const createdAt = timestamp('created_at').notNull().defaultNow()
export const updatedAt = timestamp('updated_at')
  .notNull()
  .$onUpdate(() => new Date())
