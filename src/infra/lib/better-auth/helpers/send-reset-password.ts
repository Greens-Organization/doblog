import { blogRepository } from '@/core/blog/repository'
import type { IUserDTO } from '@/core/blog/user/dto'
import { env } from '@/env'
import { EmailQueueClient } from '@/infra/email'
import { resetPasswordEmailRender } from '@/infra/email/emails'

export const sendResetPassword = async (
  data: {
    user: IUserDTO
    url: string
    token: string
  },
  request?: Request
) => {
  const blogData = await blogRepository.getBlog()
  const url = new URL(data.url)
  url.searchParams.set('callbackURL', `${env.BETTER_AUTH_URL}/sign-in`)
  const html = await resetPasswordEmailRender({
    name: data.user.name,
    url: url.toString(),
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
