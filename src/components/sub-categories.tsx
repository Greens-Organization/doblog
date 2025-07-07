'use client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface SubCategoriesProps {
  categorySlug: string
  subcategories: { name: string; slug: string }[]
}

export function SubCategories({
  categorySlug,
  subcategories
}: SubCategoriesProps) {
  const searchParams = useSearchParams()

  const isActive = (sub: string) => (searchParams.get('sub') || '') === sub
  const nonSelect = isActive('')

  return (
    <section className="py-4">
      <h2 className="mb-4 text-xl font-semibold">Subcategorias</h2>
      <div className="flex flex-wrap gap-2">
        <Link href={`/categories/${categorySlug}`}>
          <Badge
            variant={nonSelect ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-muted"
          >
            Todas
          </Badge>
        </Link>
        {subcategories.map((subCategory, i) => (
          <Link
            key={String(i)}
            href={`/categories/${categorySlug}?sub=${subCategory.slug}`}
          >
            <Badge
              variant={isActive(subCategory.slug) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-muted"
            >
              {subCategory.name}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  )
}
