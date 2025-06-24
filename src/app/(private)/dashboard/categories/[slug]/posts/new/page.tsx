import { listCategories } from '@/actions/blog/category'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import CreatePostForm from './components/create-post-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const categories = await listCategories({ slug })

  if (!categories.success) {
    toast.error(categories.error)
    redirect(`/dashboard/categories/${slug}`)
  }

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          { label: 'Posts', href: `/dashboard/categories/${slug}/posts` },
          { label: 'Criar', href: `/dashboard/categories/${slug}/posts/new` }
        ]}
      />
      <CreatePostForm categories={categories.data} />
    </section>
  )
}
