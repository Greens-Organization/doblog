import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey } from '../helpers'
import { organization } from './organization'
import { user } from './user'

export const member = pgTable('member', {
  id: idPrimaryKey,
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').default('member').notNull(),
  createdAt: createdAt
})

export type DMember = InferSelectModel<typeof member>
