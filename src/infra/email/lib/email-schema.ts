import { zod } from '@/infra/lib/zod'

export const EmailJobSchema = zod.object({
  to: zod.email(),
  subject: zod.string(),
  body: zod.string(),
  type: zod.enum(['transactional', 'marketing'])
})

export type EmailJob = zod.infer<typeof EmailJobSchema>
