import { blogRepository } from '@/core/blog/repository'
import { EmailQueueClient } from '@/infra/email'
import { emailVerificationRender } from '@/infra/email/emails'
import type { User } from 'better-auth'

export const sendVerificationEmail = async (
  data: {
    user: User
    url: string
    token: string
  },
  request?: Request
) => {
  const blogData = await blogRepository.getBlog()
  const html = await emailVerificationRender({
    name: data.user.name,
    url: data.url,
    blog: blogData
  })
  const text = await emailVerificationRender(
    {
      name: data.user.name,
      url: data.url,
      blog: blogData
    },
    true
  )

  const emailQueue = new EmailQueueClient()
  await emailQueue.addEmailJob({
    fromDisplayName: blogData?.name ?? 'Doblog',
    toDisplayName: data.user.name,
    to: data.user.email,
    subject: 'Email Verification',
    html,
    text,
    type: 'transactional'
  })
}
