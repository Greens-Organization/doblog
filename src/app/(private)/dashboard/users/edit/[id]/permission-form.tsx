'use client'
import type { listCategories } from '@/actions/blog/category'
import { updateUserCategoriesPermissions } from '@/actions/dashboard/user'
import type { SuccessData } from '@/actions/types'
import { DefaultMultiSelector } from '@/components/form/default-multiselect'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { zod } from '@/infra/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface PermissionsForm {
  categories: SuccessData<typeof listCategories>
  userId: string
  userCategories?: Array<{ name: string; id: string }>
}

const schema = zod.object({
  categories: zod.object({ value: zod.uuid() }).array()
})

export function PermissionForm({
  categories,
  userId,
  userCategories
}: PermissionsForm) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      categories: userCategories?.map((c) => ({ label: c.name, value: c.id }))
    }
  })

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Updating user permissions...')

          const res = await updateUserCategoriesPermissions({
            userId: userId,
            categories: data.categories.map((c) => c.value)
          })

          toast.dismiss()

          if (!res.success) {
            toast.error(res.error)
            return
          }

          toast.success('Updating user permissions updated.')
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
