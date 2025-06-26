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

interface EmailVerificationProps {
  name: string
  url: string
  blog?: IBlogDTO
}

export default function EmailVerification({
  name,
  url,
  blog
}: EmailVerificationProps) {
  const previewText =
    'Please verify your email address by clicking the button below.'

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
                Please verify your email address by clicking the button below.
              </Text>
              <Button
                className="box-border w-full rounded-[8px] bg-blue-600 px-[12px] py-[12px] text-center font-semibold text-white"
                href={url}
              >
                Verify Email
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

export const emailVerificationRender = async (
  data: EmailVerificationProps,
  plainText = false
) => {
  return await pretty(
    await render(<EmailVerification {...data} />, { plainText })
  )
}
