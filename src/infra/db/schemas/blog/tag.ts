import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, idPrimaryKey } from "../helpers";
import { post } from './post';

export const tag = pgTable('tag', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: createdAt
})

export const postToTag = pgTable(
  'post_to_tag',
  {
    postId: uuid('post_id') // Chave estrangeira agora é UUID
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id') // Chave estrangeira agora é UUID
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }) // Drizzle recomenda nomear a PK
  })
)

export const tagsRelations = relations(tag, ({ many }) => ({
  posts: many(postToTag)
}))