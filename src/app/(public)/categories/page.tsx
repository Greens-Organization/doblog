import { listCategories } from '@/actions/blog/category'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Suspense } from 'react'
import { CategoriesList } from './categories-list'

interface PageProps {
  searchParams: Promise<{ name?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const search = await searchParams
  const categoryPromise = listCategories({ name: search.name })

  return (
    <section>
      <Header />
      <main className="container px-4 py-12 md:px-6 mx-auto min-h-svh">
        <div className="max-w-4xl space-y-8 mx-auto">
          <Suspense fallback={null}>
            <CategoriesList categoriesPromise={categoryPromise} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </section>
  )
}
