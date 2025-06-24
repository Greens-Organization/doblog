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

interface ResetPasswordEmailProps {
  name: string
  url: string
  blog?: IBlogDTO
}

export default function ResetPasswordEmail({
  name,
  url,
  blog
}: ResetPasswordEmailProps) {
  const previewText =
    'Request to reset your password, please click the button below to reset your password.'

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
                You have requested to reset your password. Please click the
                button below to reset your password.
              </Text>
              <Button
                className="box-border w-full rounded-[8px] bg-blue-600 px-[12px] py-[12px] text-center font-semibold text-white"
                href={url}
              >
                Reset password
              </Button>
            </Section>
          </Container>
          <Container>
            <Text className="text-center text-xs text-gray-500">
              If you did not request a password reset, please ignore this email.
            </Text>
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

export const resetPasswordEmailRender = async (
  data: ResetPasswordEmailProps
) => {
  return await pretty(await render(<ResetPasswordEmail {...data} />))
}
