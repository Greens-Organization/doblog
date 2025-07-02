'use client'
import { DefaultField } from '@/components/form/default-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { authClient, useSession } from '@/infra/lib/better-auth/auth-client'
import {
  updatePasswordSchema,
  updateUserSchema
} from '@/infra/validations/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function AccountForm() {
  const { data: session, isPending } = useSession()
  const form = useForm({ resolver: zodResolver(updateUserSchema()) })
  const updatePasswordForm = useForm({
    resolver: zodResolver(updatePasswordSchema)
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  if (isPending) return null

  return (
    <Form {...form}>
      <form
        className="max-w-md space-y-3"
        id="form-update-user"
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Updating account...')
          const { error } = await authClient.updateUser({ name: data.name })
          toast.dismiss()
          error ? toast.error(error.message) : toast.success('Account updated.')
        })}
      >
        <DefaultField
          placeholder="Name"
          name="name"
          label="Name"
          defaultValue={session?.user.name}
        />
        <DefaultField
          placeholder="Email"
          name="email"
          label="Email"
          disabled
          defaultValue={session?.user.email}
        />
      </form>
      <div className="flex gap-2">
        <Button form="form-update-user" disabled={form.formState.isSubmitting}>
          Update
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" type="button">
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <Form {...updatePasswordForm}>
              <form
                className="space-y-3"
                onSubmit={updatePasswordForm.handleSubmit(async (data) => {
                  toast.loading('Updating password...')
                  const { error } = await authClient.changePassword({
                    currentPassword: data.current,
                    newPassword: data.password,
                    revokeOtherSessions: true
                  })
                  toast.dismiss()
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  toast.success('Password updated.')
                  updatePasswordForm.reset()
                  setDialogOpen(false)
                })}
              >
                <DefaultField
                  placeholder="Current Password"
                  name="current"
                  type="password"
                />
                <DefaultField
                  placeholder="New Password"
                  name="password"
                  type="password"
                />
                <DefaultField
                  placeholder="Confirm Password"
                  name="confirm"
                  type="password"
                />
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="secondary" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Change Password</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Form>
  )
}
