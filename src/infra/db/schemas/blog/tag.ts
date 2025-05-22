import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey } from '../helpers'

export const tag = pgTable('tag', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt
})

export type DTag = InferSelectModel<typeof tag>
