import { z } from 'zod/v4'

export const createSubcategorySchema = () => {
  return z.object({
    name: z
      .string({ message: 'Name must be a valid string' })
      .min(1, { message: 'Name must have at least 1 character' })
      .max(255, {
        message: 'Name must have at most 255 characters'
      }),
    slug: z
      .string({ message: 'Slug must be a valid string' })
      .min(1, {
        message: 'Slug must have at least 1 character'
      })
      .max(255, {
        message: 'Slug must have at most 255 characters'
      }),
    description: z.string().optional()
  })
}
