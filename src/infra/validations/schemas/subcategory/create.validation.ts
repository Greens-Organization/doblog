import { zod } from '@/infra/lib/zod'

export const createSubcategorySchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(3, { error: 'Name must have at least 3 character' })
      .max(255, {
        error: 'Name must have at most 255 characters'
      }),
    slug: zod
      .string({ error: 'Slug must be a valid string' })
      .min(3, {
        error: 'Slug must have at least 3 character'
      })
      .max(255, {
        error: 'Slug must have at most 255 characters'
      }),
    category_slug: zod.string({
      error: (issue) =>
        issue.input === undefined
          ? 'Category slug is required'
          : 'Category slug be a valid string'
    }),
    description: zod.string().optional()
  })
}
