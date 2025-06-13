import { zod } from '@/infra/lib/zod'

export const updateProfileSchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255, { error: 'The name must have at most 255 characters' })
      .optional(),
    email: zod.email('Email must be a valid email address').optional(),
    image: zod.url('Image must be a valid URL').optional()
  })
}
