import { z } from 'zod'

export const categorySchema = () => {
  return z.object({
    id: z
      .string({ message: 'ID must be a valid string' })
      .uuid({ message: 'ID must be a valid UUID' }),
    name: z
      .string({ message: 'Name must be a valid string' })
      .min(1, { message: 'Name ' })
      .max(255),
    slug: z.string({ message: 'Slug must be a valid string' }).min(1).max(255),
    description: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
}
