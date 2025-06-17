import { listSubcategories } from '@/actions/blog/subcategory'
import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { DefaultError } from '@/components/errors'
import { SearchFilter } from '@/components/filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import { NewSubCategorySheet } from './components/new-sub-category-sheet'
import { UpdateSubCategory } from './components/update-sub-category-sheet'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ name?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { name } = await searchParams

  const subcategories = await listSubcategories({ name: name || '' })

  if (!subcategories.success) {
    return <DefaultError description={subcategories.error} />
  }

  const { data } = subcategories.data

  const subcategoriesFromCategorySlug = data.filter(
    ({ category }) => category.slug === slug
  )

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' },
          {
            label: 'Subcategorias',
            href: `/dashboard/categories/${slug}/subcategories`
          }
        ]}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="head-text-sm">Subcategorias</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie as subcategorias do blog.
            </p>
          </div>
          <NewSubCategorySheet categorySlug={slug} />
        </div>
        <div className="flex items-center gap-2">
          <SearchFilter name="name" placeholder="Pesquisar subcategorias..." />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Postagens</TableHead>
                <TableHead>Subcategorias</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!subcategoriesFromCategorySlug.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Nenhuma categoria encontrada!
                  </TableCell>
                </TableRow>
              )}
              {subcategoriesFromCategorySlug.map((sub, i) => (
                <TableRow key={String(i)}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={'/dashboard/categories'}>Posts</Link>
                      </Button>
                      <UpdateSubCategory
                        id={sub.id}
                        description={sub.description || ''}
                        name={sub.name}
                        slug={sub.slug}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
