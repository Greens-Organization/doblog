import { z } from 'zod/v4'

export const updateSubcategorySchema = () => {
  return z.object({
    name: z
      .string({ message: 'Name must be a valid string' })
      .min(1, { message: 'Name must have at least 1 character' })
      .max(255, { message: 'Name must have at most 255 characters' })
      .optional(),
    slug: z
      .string({ message: 'Slug must be a valid string' })
      .min(1, { message: 'Slug must have at least 1 character' })
      .max(255, { message: 'Slug must have at most 255 characters' })
      .optional(),
    description: z.string().optional()
  })
}
