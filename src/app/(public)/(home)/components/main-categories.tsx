import type { listCategories } from '@/actions/blog/category'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { use } from 'react'

interface MainCategoriesProps {
  categoriesPromise: ReturnType<typeof listCategories>
}

export function MainCategories({ categoriesPromise }: MainCategoriesProps) {
  const categoriesRes = use(categoriesPromise)
  if (!categoriesRes.success) return null

  const categories = categoriesRes.data

  return (
    <section className="py-12 max-w-4xl w-full mx-auto px-4 md:px-6">
      <h2 className="text-3xl font-semibold text-center mb-12">
        Explore por Categoria
      </h2>
      <div className="grid gap-3 grid-cols-2 mt-8">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`}>
            <Card>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.subcategory.length} artigos
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-sm font-medium text-primary hover:underline">
                  Ver artigos →
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
