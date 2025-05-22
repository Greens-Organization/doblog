import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CallToAction } from './components/call-to-action'
import { Faq } from './components/faq'
import { MainCategories } from './components/main-categories'

export default function Home() {
  return (
    <section>
      <Header />
      <main className="space-y-8 py-12">
        <CallToAction />
        <MainCategories />
        <Faq />
      </main>
      <Footer />
    </section>
  )
}
