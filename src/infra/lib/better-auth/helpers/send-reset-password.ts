import { blogRepository } from '@/core/blog/repository'
import { env } from '@/env'
import { EmailQueueClient } from '@/infra/email'
import { resetPasswordEmailRender } from '@/infra/email/emails'
import type { User } from 'better-auth'

export const sendResetPassword = async (
  data: {
    user: User
    url: string
    token: string
  },
  request?: Request
) => {
  const blogData = await blogRepository.getBlog()
  const url = new URL(data.url)
  url.searchParams.set(
    'callbackURL',
    `${env.BETTER_AUTH_URL}/reset-password/${data.token}`
  )
  const html = await resetPasswordEmailRender({
    name: data.user.name,
    url: url.toString(),
    blog: blogData
  })
  const text = await resetPasswordEmailRender(
    {
      name: data.user.name,
      url: url.toString(),
      blog: blogData
    },
    true
  )

  const emailQueue = new EmailQueueClient()

  await emailQueue.addEmailJob({
    fromDisplayName: blogData?.name ?? 'Doblog',
    toDisplayName: data.user.name,
    to: data.user.email,
    subject: 'Reset Password',
    html,
    text,
    type: 'transactional'
  })
}
