import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createdAt, idPrimaryKey, updatedAt } from "../helpers";
import { subcategory } from './subcategory';

export const category = pgTable('category', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt,
  updatedAt
})

export const categoryRelations = relations(category, ({ many }) => ({
  subcategory: many(subcategory)
}))