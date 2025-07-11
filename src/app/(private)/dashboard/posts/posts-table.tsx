'use client'
import {
  type ListPosts,
  archivePost,
  moveToDraft,
  publishPost
} from '@/actions/dashboard/posts'
import { SearchFilter, SelectFilter } from '@/components/filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { format } from 'date-fns'
import { MoreVertical, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PostsTableProps {
  data: ListPosts
}

export function PostsTable({ data }: PostsTableProps) {
  const router = useRouter()
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
          <Link href="/dashboard/posts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Postagem
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <SearchFilter placeholder="Pesquisar postagens..." name="name" />
        <SelectFilter
          name="status"
          defaultValue="all"
          values={[
            { key: 'Todos Status', value: 'all' },
            { key: 'Publicado', value: 'published' },
            { key: 'Rascunho', value: 'draft' }
          ]}
        />
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
                      post.status === 'draft'
                        ? 'outline'
                        : post.status === 'archived'
                          ? 'destructive'
                          : 'default'
                    }
                  >
                    {post.status === 'published' && 'Publicado'}
                    {post.status === 'draft' && 'Rascunho'}
                    {post.status === 'archived' && 'Arquivado'}
                  </Badge>
                </TableCell>
                <TableCell>{format(post.createdAt, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {post.status === 'published' && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts/${post.slug}`} target="_blank">
                          Visualizar
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/posts/edit/${post.id}`}>
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {post.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={async () => {
                              toast.loading('Publicando seu post!')
                              const res = await publishPost(post.id)

                              toast.dismiss()
                              if (!res.success) {
                                toast.error(res.error)
                                return
                              }

                              toast.success('Post publicado!')
                              router.refresh()
                            }}
                          >
                            Publicar
                          </DropdownMenuItem>
                        )}

                        {post.status !== 'draft' && (
                          <DropdownMenuItem
                            onClick={async () => {
                              toast.loading('Moving your post to draft')
                              const res = await moveToDraft(post.id)

                              toast.dismiss()
                              if (!res.success) {
                                toast.error(res.error)
                                return
                              }
                              toast.success('Post moved to draft!')
                              router.refresh()
                            }}
                          >
                            Move to draft
                          </DropdownMenuItem>
                        )}

                        {post.status !== 'archived' && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={async () => {
                              toast.loading('Arquivando o post')
                              const res = await archivePost(post.id)
                              toast.dismiss()

                              if (!res.success) {
                                toast.error(res.error)
                                return
                              }

                              toast.success('Post arquivado com sucesso.')
                              router.refresh()
                            }}
                          >
                            Arquivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
