import { listCategories } from '@/actions/blog/category'
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
import { DashNavbar } from '../components/dash-navbar'
import { NewCategorySheet } from './components/new-category-sheet'
import { UpdateCategorySheet } from './components/update-category-sheet'

interface PageProps {
  searchParams: Promise<{ name?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { name } = await searchParams
  const categories = await listCategories({ name: name || '' })

  if (!categories.success) {
    return <DefaultError description={categories.error} />
  }

  const { data } = categories.data

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Categorias', href: '/dashboard/categories' }
        ]}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="head-text-sm">Categorias</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie as categorias e subcategorias do blog.
            </p>
          </div>
          <NewCategorySheet />
        </div>
        <div className="flex items-center gap-2">
          <SearchFilter name="name" placeholder="Pesquisar categorias..." />
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
              {!data.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Nenhuma categoria encontrada!
                  </TableCell>
                </TableRow>
              )}
              {data.map((category, i) => (
                <TableRow key={String(i)}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.totalPost}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.subcategory.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/categories/${category.slug}/posts`}
                        >
                          Posts
                        </Link>
                      </Button>
                      <UpdateCategorySheet
                        id={category.id}
                        description={category.description || ''}
                        name={category.name}
                        slug={category.slug}
                      />
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/categories/${category.slug}/subcategories`}
                        >
                          Subcategorias
                        </Link>
                      </Button>
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
