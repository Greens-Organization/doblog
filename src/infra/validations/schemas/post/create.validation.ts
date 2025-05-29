import z from 'zod/v4'

export const createPostSchema = () => {
  return z.object({
    title: z
      .string({ error: 'Name must be a valid string' })
      .min(5, { error: 'Name must have at least 5 character' }),
    slug: z.string({ error: 'Slug must be a valid string' }).min(5, {
      error: 'Slug must have at least 5 character'
    }),
    excerpt: z
      .string({ error: 'Excerpt must be a valid string' })
      .min(10, { error: 'Excerpt must have at least 10 characters' }),
    content: z.string({ error: 'Content must be a valid string' }).min(10, {
      error: 'Content must have at least 10 characters'
    }),
    featuredImage: z
      .url({ error: 'Featured image must be a valid URL' })
      .optional(),
    categorySlug: z.string({ error: 'Category slug is required' }),
    subcategorySlug: z
      .string({ error: 'Subcategory slug must be a valid string' })
      .optional()
  })
}
