import type { InferSelectModel } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, idPrimaryKey, updatedAt } from '../helpers'

export const organization = pgTable('organization', {
  id: idPrimaryKey,
  name: text('name').notNull(),
  slug: text('slug').unique(),
  description: text('description'),
  logo: text('logo'),
  keywords: text('keywords'),
  createdAt: createdAt,
  updatedAt: updatedAt,
  metadata: text('metadata')
})

export type DOrganization = InferSelectModel<typeof organization>
