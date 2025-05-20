import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, idPrimaryKey, updatedAt } from "../helpers";
import { category } from './category';
import { post } from './post';

export const subcategory = pgTable('subcategory', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id') // Chave estrangeira agora é UUID
    .notNull()
    .references(() => category.id, { onDelete: 'cascade' }),
  createdAt,
  updatedAt
})

export const subcategoryRelations = relations(
  subcategory,
  ({ one, many }) => ({
    category: one(category, {
      fields: [subcategory.categoryId],
      references: [category.id]
    }),
    posts: many(post)
  })
)