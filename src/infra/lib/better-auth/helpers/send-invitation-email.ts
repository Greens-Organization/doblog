import { blogRepository } from '@/core/blog/repository'
import type { IUserDTO } from '@/core/blog/user/dto'
import type { IMemberDTO } from '@/core/blog/user/dto/member'
import { env } from '@/env'
import type { DInvitation, DOrganization } from '@/infra/db/schemas/auth'
import { EmailQueueClient } from '@/infra/email'
import { blogInvitationRender } from '@/infra/email/emails'

export const sendInvitationEmail = async (data: {
  id: string
  role: string
  email: string
  organization: DOrganization
  invitation: DInvitation
  inviter: IMemberDTO & {
    user: IUserDTO
  }
  request?: Request
}) => {
  const blogData = await blogRepository.getBlog()

  const inviteLink = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`
  const html = await blogInvitationRender({
    name: data.inviter.user.name,
    inviteLink,
    blog: blogData
  })

  const emailQueue = new EmailQueueClient()
  await emailQueue.addEmailJob({
    to: data.inviter.user.name,
    subject: `Let's get started! Join for ${blogData!.name}`,
    body: html,
    type: 'transactional'
  })
}
