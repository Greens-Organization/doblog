import { zod } from '@/infra/lib/zod'

export const EmailJobSchema = zod.object({
  fromDisplayName: zod.string().optional(),
  to: zod.email(),
  toDisplayName: zod.string().optional(),
  subject: zod.string(),
  html: zod.string(),
  text: zod.string().optional(),
  type: zod.enum(['transactional', 'marketing'])
})

export type EmailJob = zod.infer<typeof EmailJobSchema>
