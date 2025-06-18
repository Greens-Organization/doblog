import { listPosts } from '@/actions/blog/posts/list-posts'
import { DefaultError } from '@/components/errors'
import { PostsWrapper } from '@/components/posts/posts-wrapper'
import { redirect } from 'next/navigation'
import { DashNavbar } from '../components/dash-navbar'

interface PageProps {
  searchParams: Promise<{
    subcategory: string | null
    category: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { category, subcategory } = await searchParams

  if (!category && !subcategory) redirect('/dashboard')

  const isSubCategory = Boolean(subcategory)

  const query = isSubCategory
    ? { subcategory_slug: subcategory as string }
    : { category_slug: category as string }

  const res = await listPosts(query)

  if (!res.success) return <DefaultError description={res.error} />

  const { data } = res.data

  const categoryPath = [
    { label: 'Categorias', href: '/dashboard/categories' },
    { label: 'Posts', href: `/dashboard/posts?category=${category}` }
  ]

  const subcategoryPath = [
    { label: 'Categorias', href: '/dashboard/categories' },
    {
      label: 'Subcategorias',
      href: `/dashboard/${category}/subcategories?name=${subcategory}`
    }
  ]

  const activePath = isSubCategory ? subcategoryPath : categoryPath

  return (
    <section>
      <DashNavbar
        navigation={[{ label: 'Dashboard', href: '/dashboard' }, ...activePath]}
      />
      <PostsWrapper data={data} />
    </section>
  )
}
