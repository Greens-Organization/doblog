import { z } from 'zod/v4'

export const createCategorySchema = () => {
  return z.object({
    name: z
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255),
    slug: z
      .string({ error: 'Slug must be a valid string' })
      .min(1, {
        error: 'The slug must have at least 1 character'
      })
      .max(255, {
        error: 'The slug must have at most 255 characters'
      }),
    description: z.string().optional()
  })
}
