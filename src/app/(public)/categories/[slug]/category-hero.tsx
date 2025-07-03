import type { getCategory } from '@/actions/blog/category'
import { SubCategories } from '@/components/sub-categories'
import { use } from 'react'

interface CategoryHeroProps {
  categoryPromise: ReturnType<typeof getCategory>
}

export function CategoryHero({ categoryPromise }: CategoryHeroProps) {
  const categoryRes = use(categoryPromise)

  if (!categoryRes.success) return null

  const { name, slug, subcategory, description } = categoryRes.data

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          {name}
        </h1>
        <p className="text-muted-foreground md:text-xl">{description}</p>
      </div>
      {/* <SearchFilter placeholder={`Pesquisar em ${name}...`} name="name" /> */}
      <SubCategories categorySlug={slug} subcategories={subcategory} />
    </>
  )
}
