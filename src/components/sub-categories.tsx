import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface SubCategoriesProps {
  categorySlug: string
  subcategories: { name: string; slug: string }[]
}

export function SubCategories({
  categorySlug,
  subcategories
}: SubCategoriesProps) {
  return (
    <section className="py-4">
      <h2 className="mb-4 text-xl font-semibold">Subcategorias</h2>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((subCategory, i) => (
          <Link
            key={String(i)}
            href={`/categories/${categorySlug}?sub=${subCategory.slug}`}
          >
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              {subCategory.name}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  )
}
