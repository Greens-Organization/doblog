import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { category } from '../blog'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'
import { user } from './user'

export const userToCategory = pgTable('user_to_category', {
  id: idPrimaryKey,
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  categoryId: text('category_id')
    .notNull()
    .references(() => category.id),
  createdAt,
  updatedAt
})

export type DUserToCategory = InferSelectModel<typeof userToCategory>
