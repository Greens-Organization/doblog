import { z } from 'zod/v4'

export const createSubcategorySchema = () => {
  return z.object({
    name: z
      .string({ error: 'Name must be a valid string' })
      .min(3, { error: 'Name must have at least 3 character' })
      .max(255, {
        error: 'Name must have at most 255 characters'
      }),
    slug: z
      .string({ error: 'Slug must be a valid string' })
      .min(3, {
        error: 'Slug must have at least 3 character'
      })
      .max(255, {
        error: 'Slug must have at most 255 characters'
      }),
    categorySlug: z.string({
      error: (issue) =>
        issue.input === undefined
          ? 'Category slug is required'
          : 'Category slug be a valid string'
    }),
    description: z.string().optional()
  })
}
