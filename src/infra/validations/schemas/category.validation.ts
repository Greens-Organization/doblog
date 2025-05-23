import { z } from 'zod'

export const categorySchema = () => {
  return z.object({
    name: z
      .string({ message: 'Name must be a valid string' })
      .min(1, { message: 'Name ' })
      .max(255),
    slug: z.string({ message: 'Slug must be a valid string' }).min(1).max(255),
    description: z.string().optional()
  })
}
