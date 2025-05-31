import { zod } from '@/infra/lib/zod'

export const createCategorySchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255),
    slug: zod
      .string({ error: 'Slug must be a valid string' })
      .min(1, {
        error: 'The slug must have at least 1 character'
      })
      .max(255, {
        error: 'The slug must have at most 255 characters'
      }),
    description: zod.string().optional()
  })
}
