'use client'
import { useConfig } from '@/components/providers/config-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {} from '@/components/ui/card'
import { authClient } from '@/infra/lib/better-auth/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AcceptInvite({ id }: { id: string }) {
  const router = useRouter()
  const { config } = useConfig()

  async function confirmInvite() {
    toast.loading('Confirming your invitation')
    const { error } = await authClient.organization.acceptInvitation({
      invitationId: id
    })

    toast.dismiss()

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Invitation confirmed!')
    router.push('/dashboard')
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col items-center">
        <Avatar className="hover:blur-xs duration-300">
          <AvatarImage src={config.logo} />
          <AvatarFallback>{config.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold">{config.name}</h2>
      </div>
      <Button onClick={confirmInvite} className="w-full">
        Accept invite
      </Button>
    </section>
  )
}
