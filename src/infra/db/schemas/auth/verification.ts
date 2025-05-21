import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'
import type { InferSelectModel } from 'drizzle-orm'

export const verification = pgTable('verification', {
  id: idPrimaryKey,
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt,
  updatedAt
})

export type DVerification = InferSelectModel<typeof verification>
