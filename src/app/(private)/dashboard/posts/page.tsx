import { listPosts } from '@/actions/dashboard/posts'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { DefaultError } from '@/components/errors'
import { PostsTable } from './posts-table'

interface PageProps {
  searchParams: Promise<{ status?: string; name?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const search = await searchParams
  const res = await listPosts({ name: search.name, status: search.status })

  if (!res.success) return <DefaultError description={res.error} />

  const { data } = res.data

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Posts', href: '/dashboard/posts' }
        ]}
      />
      <PostsTable data={data} />
    </section>
  )
}
