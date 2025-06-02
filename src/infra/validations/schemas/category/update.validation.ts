import { zod } from '@/infra/lib/zod'

export const updateCategorySchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'Name must have at least 1 character' })
      .max(255, { error: 'Name must have at most 255 characters' })
      .optional(),
    slug: zod
      .string({ error: 'Slug must be a valid string' })
      .min(1, { error: 'Slug must have at least 1 character' })
      .max(255, { error: 'Slug must have at most 255 characters' })
      .optional(),
    description: zod.string().optional()
  })
}
