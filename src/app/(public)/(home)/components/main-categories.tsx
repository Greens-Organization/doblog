import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'

const categories = [
  {
    id: 1,
    name: 'Tecnologia',
    description:
      'Artigos sobre programação, desenvolvimento web e novas tecnologias',
    postCount: 42,
    slug: 'tecnologia'
  },
  {
    id: 2,
    name: 'Design',
    description: 'Dicas de UI/UX, design gráfico e tendências visuais',
    postCount: 28,
    slug: 'design'
  },
  {
    id: 3,
    name: 'Marketing',
    description: 'Estratégias de marketing digital, SEO e redes sociais',
    postCount: 35,
    slug: 'marketing'
  },
  {
    id: 4,
    name: 'Negócios',
    description: 'Empreendedorismo, gestão e crescimento de negócios',
    postCount: 21,
    slug: 'negocios'
  }
]

export function MainCategories() {
  return (
    <section className="py-12 container mx-auto px-4 md:px-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Categorias Principais
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Explore nossos conteúdos organizados por temas
        </p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="focus:outline-2 focus:border-0"
          >
            <Card className="h-full transition-all hover:shadow-md focus:border-green-500 focus:outline-green-300">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.postCount} artigos
                </p>
              </CardContent>
              <CardFooter>
                <div className="text-sm font-medium text-primary hover:underline">
                  Ver artigos →
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
