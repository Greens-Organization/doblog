'use client'
import { createBlog, createFirstUser } from '@/actions/dashboard/config'
import { createBlogSchema } from '@/infra/validations/schemas/blog'
import { createFirstUserSchema } from '@/infra/validations/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { DefaultField } from './form/default-field'
import { useConfig } from './providers/config-provider'
import { Button } from './ui/button'
import { Form } from './ui/form'

export function ConfigModal() {
  const { hasAdmin, blogCreated, hasError } = useConfig()

  if (hasAdmin && blogCreated) return null
  return (
    <div className="fixed left-0 top-0 bg-background/95 h-svh w-svw backdrop-blur-md flex justify-center items-center">
      <section className="max-w-sm w-full">
        {blogCreated && hasError ? <SetupFirstUserForm /> : <SetupBlogForm />}
      </section>
    </div>
  )
}

function SetupBlogForm() {
  const form = useForm({ resolver: zodResolver(createBlogSchema()) })
  const router = useRouter()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Creating your blog config')
          const res = await createBlog(data)

          toast.dismiss()
          if (!res.success) {
            toast.error(res.error)
            return
          }
          toast.success('Blog config created!')
          router.refresh()
        })}
        className="space-y-3"
      >
        <h1 className="font-semibold text-xl text-center">
          Configure your blog
        </h1>
        <DefaultField label="Name" placeholder="Doblog" name="name" />
        <DefaultField
          name="description"
          label="Description"
          placeholder="Doblog is the easiest way to launch your blog for your business"
        />
        <DefaultField
          name="logo"
          label="Logo URL"
          placeholder="https://avatars.githubusercontent.com/u/82120356"
        />
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          Confirm
        </Button>
      </form>
    </Form>
  )
}

function SetupFirstUserForm() {
  const form = useForm({ resolver: zodResolver(createFirstUserSchema()) })
  const router = useRouter()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Creating your admin user')
          const res = await createFirstUser(data)

          toast.dismiss()
          if (!res.success) {
            toast.error(res.error)
            return
          }
          toast.success('Your account are created!')
          router.refresh()
        })}
        className="space-y-3"
      >
        <h1 className="font-semibold text-xl text-center">
          Configure your account
        </h1>
        <DefaultField label="Name" placeholder="Souljorn" name="name" />
        <DefaultField
          label="Email"
          type="email"
          placeholder="souljorn@mail.com"
          name="email"
        />
        <DefaultField
          type="password"
          name="password"
          label="Password"
          placeholder="U2VuaGExMjMu"
        />
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          Confirm
        </Button>
      </form>
    </Form>
  )
}
