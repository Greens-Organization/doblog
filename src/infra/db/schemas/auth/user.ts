import type { InferSelectModel } from 'drizzle-orm'
import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'

export const user = pgTable('user', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  role: text('role', { enum: ['user', 'editor', 'admin'] })
    .default('user')
    .notNull(),
  createdAt,
  updatedAt
})

export type DUser = InferSelectModel<typeof user>
