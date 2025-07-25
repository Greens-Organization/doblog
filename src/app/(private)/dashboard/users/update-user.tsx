import { updateUser } from '@/actions/dashboard/user'
import { DefaultField } from '@/components/form/default-field'
import { DefaultSelectField } from '@/components/form/default-select-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { type IUserDTO, UserRole } from '@/core/blog/user/dto'
import { updateUserSchema } from '@/infra/validations/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface UpdateUserProps {
  children: React.ReactNode
  user: IUserDTO
}

export function UpdateUser({ children, user }: UpdateUserProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(updateUserSchema()),
    defaultValues: {
      email: user.email,
      name: user.name,
      role: user.role as UserRole
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="px-4 space-y-3"
            onSubmit={form.handleSubmit(async (data) => {
              toast.loading('Updating user...')
              const res = await updateUser({ id: user.id, ...data })

              if (!res.success) {
                toast.error(res.error)
                return
              }

              toast.success('User updated.')
              router.refresh()
              setOpen(false)
            })}
          >
            <DefaultField name="name" label="Nome" />
            <DefaultField name="email" type="email" label="Email" />
            <DefaultSelectField
              name="role"
              label="Role"
              values={[
                { label: 'Admin', value: UserRole.ADMIN },
                { label: 'Editor', value: UserRole.EDITOR }
              ]}
            />
            <Button className="w-full">Atualizar</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
