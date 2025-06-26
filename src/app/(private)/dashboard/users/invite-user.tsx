'use client'

import { DefaultField } from '@/components/form/default-field'
import { DefaultSelectField } from '@/components/form/default-select-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { UserRole } from '@/core/blog/user/dto'
import { authClient } from '@/infra/lib/better-auth/auth-client'
import { zod } from '@/infra/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const schema = zod.object({
  email: zod.email('Email must be a valid email address'),
  role: zod.enum(
    [UserRole.ADMIN, UserRole.EDITOR],
    'Role must be a valid user role'
  )
})

export function InviteUser() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: UserRole.EDITOR }
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Invite</Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (body) => {
              toast.loading('Sending invite...')
              const { error } = await authClient.organization.inviteMember({
                email: body.email,
                role: body.role
              })
              toast.dismiss()
              if (error) {
                toast.error(error.message)
                return
              }
              toast.success('Invite submited!')
            })}
          >
            <DefaultField
              type="email"
              name="email"
              label="Email"
              placeholder="Ex: drawer@domain.com"
            />
            <DefaultSelectField
              name="role"
              label="Role"
              values={[
                { label: 'Admin', value: UserRole.ADMIN },
                { label: 'Editor', value: UserRole.EDITOR }
              ]}
            />
            <Button className="w-full">Confirm invite</Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
