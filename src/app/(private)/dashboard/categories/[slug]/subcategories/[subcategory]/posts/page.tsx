import { listPosts } from '@/actions/blog/posts/list-posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { PostsWrapper } from '@/components/posts/posts-wrapper'

interface PageProps {
  params: Promise<{ slug: string; subcategory: string }>
}

export default async function PostsPage({ params }: PageProps) {
  const { subcategory, slug } = await params
  const res = await listPosts({ subcategory_slug: subcategory })

  if (!res.success) {
    // TODO: add error message
    return 'Error'
  }

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          {
            label: 'Subcategorias',
            href: `/dashboard/categories/${slug}/subcategories`
          },
          {
            label: 'Posts',
            href: `/dashboard/categories/${slug}/subcategories/${subcategory}/posts`
          }
        ]}
      />
      <PostsWrapper data={res.data} />
    </section>
  )
}
