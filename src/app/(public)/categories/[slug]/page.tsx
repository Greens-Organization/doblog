import { getCategory } from '@/actions/blog/category'
import { listPosts } from '@/actions/blog/post'
import { PostList } from '@/app/(public)/categories/[slug]/post-list'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Suspense } from 'react'
import { CategoryHero } from './category-hero'

interface PageProps {
  searchParams: Promise<{ sub?: string }>
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { sub } = await searchParams

  const categoryPromise = getCategory(slug)
  const postsPromise = listPosts(
    sub ? { subcategory_slug: sub } : { category_slug: slug }
  )

  return (
    <section>
      <Header />
      <main className="container px-4 py-12 md:px-6 mx-auto min-h-svh">
        <div className="max-w-4xl space-y-8 mx-auto">
          <Suspense fallback={null}>
            <CategoryHero categoryPromise={categoryPromise} />
          </Suspense>
          <Suspense fallback={null}>
            <PostList postsPromise={postsPromise} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </section>
  )
}
