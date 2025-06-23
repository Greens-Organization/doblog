import { listPosts } from '@/actions/dashboard/posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { DefaultError } from '@/components/errors'
import { PostsWrapper } from '@/components/posts/posts-wrapper'

interface PageProps {
  params: Promise<{
    slug: string
    subcategory: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug, subcategory } = await params

  const res = await listPosts({ subcategory_slug: subcategory })

  if (!res.success) return <DefaultError description={res.error} />

  const { data } = res.data

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          {
            label: 'Subcategorias',
            href: `/dashboard/${slug}/subcategories?name=${subcategory}`
          },
          { label: 'Posts', href: `/dashboard/posts?category=${slug}` }
        ]}
      />
      <PostsWrapper data={data} category={slug} />
    </section>
  )
}
