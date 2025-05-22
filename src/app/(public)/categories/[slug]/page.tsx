import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { PostList } from '@/components/post-list'
import { SubCategories } from '@/components/sub-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const category = {
    id: 1,
    name: 'Tecnologia',
    description:
      'Artigos sobre programação, desenvolvimento web e novas tecnologias'
  }

  return (
    <section>
      <Header />
      <main className="container px-4 py-12 md:px-6 mx-auto min-h-svh">
        <div className="max-w-4xl space-y-8 mx-auto">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {category.name}
            </h1>
            <p className="text-muted-foreground md:text-xl">
              {category.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Pesquisar em ${category.name}...`}
                className="w-full pl-10"
              />
            </div>
            <Button type="submit">Pesquisar</Button>
          </div>
          <SubCategories categorySlug={slug} />
          <PostList categorySlug={slug} />
        </div>
      </main>
      <Footer />
    </section>
  )
}
