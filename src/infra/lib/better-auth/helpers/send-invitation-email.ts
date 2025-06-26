import { blogRepository } from '@/core/blog/repository'
import { env } from '@/env'
import { EmailQueueClient } from '@/infra/email'
import { blogInvitationRender } from '@/infra/email/emails'
import type { User } from 'better-auth'
import type { Invitation, Member, Organization } from 'better-auth/plugins'

export const sendInvitationEmail = async (data: {
  id: string
  role: string
  email: string
  organization: Organization
  invitation: Invitation
  inviter: Member & {
    user: User
  }
  request?: Request
}) => {
  const blogData = await blogRepository.getBlog()

  const inviteLink = `${env.BETTER_AUTH_URL}/invite/${data.id}`
  const html = await blogInvitationRender({
    inviteLink,
    blog: blogData
  })
  const text = await blogInvitationRender(
    {
      inviteLink,
      blog: blogData
    },
    true
  )

  const emailQueue = new EmailQueueClient()
  await emailQueue.addEmailJob({
    fromDisplayName: blogData?.name ?? 'Doblog',
    to: data.invitation.email,
    subject: `Let's get started! Join for ${blogData!.name}`,
    html,
    text,
    type: 'transactional'
  })
}
