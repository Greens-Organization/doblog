import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'
import { user } from './user'

export const session = pgTable('session', {
  id: idPrimaryKey,
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt,
  updatedAt,
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: text('active_organization_id')
})

export type DSession = InferSelectModel<typeof session>
