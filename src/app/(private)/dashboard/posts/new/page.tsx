import { listCategories } from '@/actions/dashboard/category'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { CreatePostForm } from './create-post-form'

export default async function Page() {
  const categories = await listCategories({})

  if (!categories.success) {
    toast.error(categories.error)
    redirect('/dashboard/posts')
  }

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          { label: 'Posts', href: '/dashboard/posts' },
          { label: 'Criar', href: '/dashboard/categories/new' }
        ]}
      />
      <CreatePostForm categories={categories.data} />
    </section>
  )
}
