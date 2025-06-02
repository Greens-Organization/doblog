import { listCategories } from '@/actions/blog/category/list-categories'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { DashNavbar } from '../components/dash-navbar'

export default async function CategoriesPage() {
  const categories = await listCategories()

  if (!categories.success) {
    // TODO: add error message
    return 'Error'
  }

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
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Categoria
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar categorias..." className="pl-10" />
          </div>
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
              {categories.data.map((category, i) => (
                <TableRow key={String(i)}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{0}</Badge>
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
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/categories/edit/${category.slug}`}
                        >
                          Editar
                        </Link>
                      </Button>
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
