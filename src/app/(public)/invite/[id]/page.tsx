import { getUser } from '@/infra/lib/better-auth/auth-utils'
import { redirect } from 'next/navigation'
import { AcceptInvite } from './accept-invite'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect(`/sign-up?callbackURL=/invite/${id}`)
    return
  }

  return <AcceptInvite id={id} />
}
