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

export default function CategoriesPage() {
  const categories = [
    {
      id: 1,
      name: 'Tecnologia',
      slug: 'tecnologia',
      postCount: 42,
      subcategories: 5
    },
    {
      id: 2,
      name: 'Design',
      slug: 'design',
      postCount: 28,
      subcategories: 4
    },
    {
      id: 3,
      name: 'Marketing',
      slug: 'marketing',
      postCount: 35,
      subcategories: 4
    },
    {
      id: 4,
      name: 'Negócios',
      slug: 'negocios',
      postCount: 21,
      subcategories: 4
    }
  ]

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
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.postCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.subcategories}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/categories/edit/${category.id}`}
                        >
                          Editar
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/categories/${category.id}/subcategories`}
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
