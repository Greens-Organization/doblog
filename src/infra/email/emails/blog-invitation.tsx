import type { IBlogDTO } from '@/core/blog/dto'
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components'
import { pretty, render } from '@react-email/render'

interface BlogInvitationEmailProps {
  name: string
  inviteLink: string
  blog?: IBlogDTO
}

export default function BlogInvitationEmail({
  name,
  inviteLink,
  blog
}: BlogInvitationEmailProps) {
  const previewText = 'Click the link in the message to accept the invitation!'

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section>
              <Text className="font-semibold">Hello {name}!</Text>
              <Text className="mt-4">
                To accept the invitation, click on the link below
              </Text>
              <Button
                className="box-border w-full rounded-[8px] bg-blue-600 px-[12px] py-[12px] text-center font-semibold text-white"
                href={inviteLink}
              >
                Accept invitation
              </Button>
            </Section>
          </Container>
          <Container>
            <Text className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} {blog?.name ?? 'Doblog'}. All rights
              reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const blogInvitationRender = async (data: BlogInvitationEmailProps) => {
  return await pretty(await render(<BlogInvitationEmail {...data} />))
}
