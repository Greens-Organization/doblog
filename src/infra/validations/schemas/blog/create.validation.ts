import { zod } from '@/infra/lib/zod'

export const createBlogSchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255, { error: 'The name must have at most 255 characters' }),
    description: zod.string().optional(),
    logo: zod.string().optional()
  })
}
