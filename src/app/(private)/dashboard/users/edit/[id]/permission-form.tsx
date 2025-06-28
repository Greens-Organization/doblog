'use client'
import type { listCategories } from '@/actions/blog/category'
import { updateUser } from '@/actions/dashboard/user'
import type { SuccessData } from '@/actions/types'
import { DefaultMultiSelector } from '@/components/form/default-multiselect'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { updateUserSchema } from '@/infra/validations/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface PermissionsForm {
  categories: SuccessData<typeof listCategories>
}

export function PermissionForm({ categories }: PermissionsForm) {
  const form = useForm({ resolver: zodResolver(updateUserSchema()) })

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Updating user...')
          const res = await updateUser({ id: 'user.id', ...data })

          if (!res.success) {
            toast.error(res.error)
            return
          }

          toast.success('User updated.')
        })}
      >
        <DefaultMultiSelector
          name="categories"
          label="Permitted Categories"
          placeholder="Select categories"
          description="The editor will have permission to post in any category if left empty"
          values={categories.data.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Button>Update permissions</Button>
      </form>
    </Form>
  )
}
