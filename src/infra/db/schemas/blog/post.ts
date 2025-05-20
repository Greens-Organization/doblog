import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from '../auth/user';
import { createdAt, idPrimaryKey, updatedAt } from "../helpers";
import { subcategory } from './subcategory';
import { postToTag, tag } from './tag';

export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived']);

export const post = pgTable('post', {
  id: idPrimaryKey,
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  status: postStatusEnum('status') // Usando o pgEnum definido
    .default('draft')
    .notNull(),
  subcategoryId: uuid('subcategory_id') // Chave estrangeira agora é UUID
    .notNull()
    .references(() => subcategory.id), // onDelete: 'restrict' por padrão
  authorId: uuid('author_id') // Chave estrangeira agora é UUID
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt,
  updatedAt,
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }) // Timestamp nativo
})

export const postsRelations = relations(post, ({ one, many }) => ({
  subcategory: one(subcategory, {
    fields: [post.subcategoryId],
    references: [subcategory.id]
  }),
  author: one(user, {
    fields: [post.authorId],
    references: [user.id]
  }),
  tags: many(postToTag)
}))

export const postsToTagsRelations = relations(postToTag, ({ one }) => ({
  post: one(post, {
    fields: [postToTag.postId],
    references: [post.id]
  }),
  tag: one(tag, {
    fields: [postToTag.tagId],
    references: [tag.id]
  })
}))
