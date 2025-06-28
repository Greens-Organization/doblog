import { listCategories } from '@/actions/blog/category'
import { getUser } from '@/actions/dashboard/user'
import { redirect } from 'next/navigation'
import { DashNavbar } from '../../../components/dash-navbar'
import { GeneralInfoForm } from './general-info-form'
import { PermissionForm } from './permission-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const [user, categories] = await Promise.all([getUser(id), listCategories()])

  if (!user.success) return redirect('/dashboard/users')

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
          { label: 'Edit', href: '/dashboard/users/edit' }
        ]}
      />
      <main className="grid grid-cols-2">
        <section className="p-4 space-y-3">
          <h1 className="font-semibold text-2xl">General Information</h1>
          <GeneralInfoForm user={user.data} />
        </section>
        {user.data.role === 'admin' ? (
          <p className="text-sm text-muted-foreground self-center text-center">
            Have a great day! 🤍
          </p>
        ) : (
          <section className="p-4 space-y-3">
            <hgroup className="space-y-2">
              <h1 className="font-semibold text-2xl">Permissions</h1>
              <p className="text-sm text-muted-foreground">
                If you want to restrict access to specific categories for the
                editor, specify them in the{' '}
                <span className="underline">categories</span> field.
              </p>
            </hgroup>
            {categories.success ? (
              <PermissionForm categories={categories.data} />
            ) : (
              <p>Error: {categories.error}</p>
            )}
          </section>
        )}
      </main>
    </section>
  )
}
