import { zod } from '@/infra/lib/zod'

export const EmailJobSchema = zod.object({
  to: zod.email(),
  sender: zod.string(),
  subject: zod.string(),
  html: zod.string(),
  text: zod.string().optional(),
  type: zod.enum(['transactional', 'marketing'])
})

export type EmailJob = zod.infer<typeof EmailJobSchema>
