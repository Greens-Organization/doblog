import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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

export default function PostsPage() {
  // Simulação de posts - em produção, viriam do banco de dados
  const posts = [
    {
      id: 1,
      title: 'Introdução ao Next.js 14',
      category: 'Tecnologia',
      status: 'Publicado',
      date: '15/12/2023',
      author: 'João Silva'
    },
    {
      id: 2,
      title: 'Tailwind CSS v4: O que esperar',
      category: 'Tecnologia',
      status: 'Publicado',
      date: '10/12/2023',
      author: 'Maria Oliveira'
    },
    {
      id: 3,
      title: 'TypeScript: Dicas para iniciantes',
      category: 'Tecnologia',
      status: 'Publicado',
      date: '05/12/2023',
      author: 'Pedro Santos'
    },
    {
      id: 4,
      title: 'React Server Components explicados',
      category: 'Tecnologia',
      status: 'Publicado',
      date: '28/11/2023',
      author: 'Ana Costa'
    },
    {
      id: 5,
      title: 'Tendências de UI/UX para 2024',
      category: 'Design',
      status: 'Rascunho',
      date: '20/11/2023',
      author: 'Carlos Mendes'
    }
  ]

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Postagens', href: '/dashboard/posts' }
        ]}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="head-text-sm">Postagens</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie todas as postagens do blog.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Postagem
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar postagens..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="tecnologia">Tecnologia</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="negocios">Negócios</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === 'Publicado' ? 'default' : 'outline'
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/posts/edit/${post.id}`}>
                          Editar
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts/${post.id}`} target="_blank">
                          Visualizar
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
