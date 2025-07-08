import { listCategories } from '@/actions/blog/category'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CallToAction } from './components/call-to-action'
import { MainCategories } from './components/main-categories'

export default function Page() {
  const categoriesPromise = listCategories()

  return (
    <section className="min-h-svh flex flex-col">
      <Header />
      <main className="space-y-8 py-12 flex flex-1 flex-col">
        <CallToAction />
        <MainCategories categoriesPromise={categoriesPromise} />
      </main>
      <Footer />
    </section>
  )
}
