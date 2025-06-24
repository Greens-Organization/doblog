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

  const emailQueue = new EmailQueueClient()
  await emailQueue.addEmailJob({
    to: data.user.email,
    subject: 'Reset Password',
    body: html,
    type: 'transactional'
  })
}
