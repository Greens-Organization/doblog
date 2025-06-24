import { listPosts } from '@/actions/blog/posts/list-posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { DefaultError } from '@/components/errors'
import { PostsWrapper } from '@/components/posts/posts-wrapper'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostsPage({ params }: PageProps) {
  const { slug } = await params
  const res = await listPosts({ category_slug: slug })

  if (!res.success) return <DefaultError description={res.error} />

  const { category } = res.data

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          {
            label: 'Posts',
            href: `/dashboard/categories/${category.slug}/posts`
          }
        ]}
      />
      <PostsWrapper data={res.data} />
    </section>
  )
}
