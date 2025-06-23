import { listCategories } from '@/actions/blog/category'
import { getPost } from '@/actions/dashboard/posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { UpdatePostForm } from './components/update-post-form'

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug, id: postId } = await params
  const categories = await listCategories({ slug })

  const post = await getPost(postId)

  if (!categories.success) {
    toast.error(categories.error)
    redirect(`/dashboard/categories/${slug}`)
  }

  if (!post.success) {
    toast.dismiss()
    toast.error(post.error)
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
      <UpdatePostForm categories={categories.data} post={post.data} />
    </section>
  )
}
