import { listCategories } from '@/actions/dashboard/category'
import { getPost } from '@/actions/dashboard/posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { UpdatePostForm } from './components/update-post-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id: postId } = await params
  const categories = await listCategories()

  const post = await getPost(postId)

  if (!categories.success) {
    toast.error(categories.error)
    redirect('/dashboard/posts')
  }

  if (!post.success) {
    toast.dismiss()
    toast.error(post.error)
    redirect('/dashboard/posts')
  }

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          { label: 'Posts', href: '/dashboard/posts' },
          { label: 'Editar', href: `/dashboard/posts/edit/${postId}` }
        ]}
      />
      <UpdatePostForm categories={categories.data} post={post.data} />
    </section>
  )
}
