import type { ListPosts } from '@/actions/blog/posts/list-posts'
import { PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'

interface PostsWrapperProps {
  data: ListPosts
  category: string
}

export function PostsWrapper({ data, category }: PostsWrapperProps) {
  return (
    <section className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="head-text-sm">Postagens</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie todas as postagens do blog.
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/categories/${category}/posts/new`}>
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
            {data.map((post, i) => (
              <TableRow key={String(i)}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.subcategory.category.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === 'published' ? 'default' : 'outline'
                    }
                  >
                    {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/categories/${category}/posts/edit/${post.slug}`}
                      >
                        Editar
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/posts/${post.slug}`} target="_blank">
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
    </section>
  )
}
