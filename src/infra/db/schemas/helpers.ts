import { text, timestamp } from 'drizzle-orm/pg-core'

export const idPrimaryKey = text('id')
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID())
export const createdAt = timestamp('created_at').defaultNow()
export const updatedAt = timestamp('updated_at').$onUpdate(() => new Date())
