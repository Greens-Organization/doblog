import { zod } from '@/infra/lib/zod'

export const createPostSchema = () => {
  return zod.object({
    title: zod
      .string({ error: 'Name must be a valid string' })
      .min(5, { error: 'Name must have at least 5 character' }),
    slug: zod.string({ error: 'Slug must be a valid string' }).min(5, {
      error: 'Slug must have at least 5 character'
    }),
    excerpt: zod
      .string({ error: 'Excerpt must be a valid string' })
      .min(10, { error: 'Excerpt must have at least 10 characters' }),
    content: zod.string({ error: 'Content must be a valid string' }).min(10, {
      error: 'Content must have at least 10 characters'
    }),
    featuredImage: zod
      .url({ error: 'Featured image must be a valid URL' })
      .optional(),
    categorySlug: zod.string({ error: 'Category slug is required' }),
    subcategorySlug: zod
      .string({ error: 'Subcategory slug must be a valid string' })
      .optional()
  })
}
