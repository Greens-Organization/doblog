import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface SubCategoriesProps {
  categorySlug: string
}

const getSubCategories = (categorySlug: string) => {
  const subCategoriesMap: Record<
    string,
    Array<{ id: number; name: string; slug: string }>
  > = {
    tecnologia: [
      { id: 1, name: 'Desenvolvimento Web', slug: 'desenvolvimento-web' },
      { id: 2, name: 'Mobile', slug: 'mobile' },
      {
        id: 3,
        name: 'Inteligência Artificial',
        slug: 'inteligencia-artificial'
      },
      { id: 4, name: 'DevOps', slug: 'devops' },
      { id: 5, name: 'Cloud Computing', slug: 'cloud-computing' }
    ],
    design: [
      { id: 1, name: 'UI/UX', slug: 'ui-ux' },
      { id: 2, name: 'Design Gráfico', slug: 'design-grafico' },
      { id: 3, name: 'Tipografia', slug: 'tipografia' },
      { id: 4, name: 'Ilustração', slug: 'ilustracao' }
    ],
    marketing: [
      { id: 1, name: 'SEO', slug: 'seo' },
      { id: 2, name: 'Redes Sociais', slug: 'redes-sociais' },
      { id: 3, name: 'Email Marketing', slug: 'email-marketing' },
      { id: 4, name: 'Conteúdo', slug: 'conteudo' }
    ],
    negocios: [
      { id: 1, name: 'Empreendedorismo', slug: 'empreendedorismo' },
      { id: 2, name: 'Gestão', slug: 'gestao' },
      { id: 3, name: 'Finanças', slug: 'financas' },
      { id: 4, name: 'Startups', slug: 'startups' }
    ]
  }

  return subCategoriesMap[categorySlug] || []
}

export function SubCategories({ categorySlug }: SubCategoriesProps) {
  const subCategories = getSubCategories(categorySlug)

  return (
    <section className="py-4">
      <h2 className="mb-4 text-xl font-semibold">Subcategorias</h2>
      <div className="flex flex-wrap gap-2">
        {subCategories.map((subCategory) => (
          <Link
            key={subCategory.id}
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
