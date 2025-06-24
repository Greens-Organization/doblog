import { type InferSelectModel, relations } from 'drizzle-orm'
import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'
import { category } from './category'
import { post } from './post'

export const subcategory = pgTable('subcategory', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => category.id, { onDelete: 'cascade' }),
  createdAt,
  updatedAt
})

export const subcategoryRelations = relations(subcategory, ({ one, many }) => ({
  category: one(category, {
    fields: [subcategory.categoryId],
    references: [category.id]
  }),
  posts: many(post)
}))

export type DSubcategory = InferSelectModel<typeof subcategory>
