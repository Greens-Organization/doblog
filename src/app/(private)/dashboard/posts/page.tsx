import { listPosts } from '@/actions/dashboard/posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { DefaultError } from '@/components/errors'
import { PostsWrapper } from './posts-table'

export default async function Page() {
  const res = await listPosts({})

  if (!res.success) return <DefaultError description={res.error} />

  const { data } = res.data

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' }
        ]}
      />
      <PostsWrapper data={data} />
    </section>
  )
}
