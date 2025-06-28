'use client'
import { updateUser } from '@/actions/dashboard/user'
import { DefaultField } from '@/components/form/default-field'
import { DefaultSelectField } from '@/components/form/default-select-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { type IUserDTO, UserRole } from '@/core/blog/user/dto'
import { updateUserSchema } from '@/infra/validations/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function GeneralInfoForm({ user }: { user: IUserDTO }) {
  const form = useForm({
    resolver: zodResolver(updateUserSchema()),
    defaultValues: {
      email: user.email,
      name: user.name,
      role: user.role as UserRole
    }
  })

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          console.log(user.id)
          toast.loading('Updating user...')
          const res = await updateUser({ id: user.id, ...data })

          toast.dismiss()
          if (!res.success) {
            toast.error(res.error)
            return
          }

          toast.success('User updated.')
        })}
      >
        <DefaultField name="name" label="Name" />
        <DefaultField name="email" type="email" label="Email" />
        <DefaultSelectField
          name="role"
          label="Role"
          values={[
            { label: 'Admin', value: UserRole.ADMIN },
            { label: 'Editor', value: UserRole.EDITOR }
          ]}
        />
        <Button>Update</Button>
      </form>
    </Form>
  )
}
