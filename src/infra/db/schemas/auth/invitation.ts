import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { idPrimaryKey } from '../helpers'
import { organization } from './organization'
import { user } from './user'

export const invitation = pgTable('invitation', {
  id: idPrimaryKey,
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
})

export type DInvitation = InferSelectModel<typeof invitation>
