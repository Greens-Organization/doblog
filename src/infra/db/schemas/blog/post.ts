import { type InferSelectModel, relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from '../auth/user'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'
import { subcategory } from './subcategory'

export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived'
])

export const post = pgTable('post', {
  id: idPrimaryKey,
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  status: postStatusEnum('status').default('draft').notNull(),
  subcategoryId: text('subcategory_id')
    .notNull()
    .references(() => subcategory.id),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt,
  updatedAt,
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' })
})

export const postsRelations = relations(post, ({ one, many }) => ({
  subcategory: one(subcategory, {
    fields: [post.subcategoryId],
    references: [subcategory.id]
  }),
  author: one(user, {
    fields: [post.authorId],
    references: [user.id]
  })
}))

export type DPost = InferSelectModel<typeof post>
