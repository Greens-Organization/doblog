import type { listCategories } from '@/actions/blog/category'
import { SearchFilter } from '@/components/filters'
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

interface CategoriesListProps {
  categoriesPromise: ReturnType<typeof listCategories>
}

export function CategoriesList({ categoriesPromise }: CategoriesListProps) {
  const categoriesRes = use(categoriesPromise)
  if (!categoriesRes.success) return null

  const categories = categoriesRes.data

  return (
    <>
      <hgroup className="space-y-1">
        <h2 className="text-3xl font-medium">Categories</h2>
        <p className="text-muted-foreground">
          Explore our content organized by themes.
        </p>
      </hgroup>

      <SearchFilter name="name" placeholder="Search by category..." />
      {!categories.length && (
        <p className="text-muted-foreground text-sm">
          Nenhuma categoria encontrada!
        </p>
      )}
      <section className="grid gap-3 grid-cols-2">
        {categories.map((category) => (
          <Card key={category.slug}>
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
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver artigos →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  )
}
