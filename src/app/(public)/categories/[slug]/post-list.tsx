import type { listPosts } from '@/actions/blog/post'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'

interface PostListProps {
  postsPromise: ReturnType<typeof listPosts>
}

export function PostList({ postsPromise }: PostListProps) {
  const allPosts = use(postsPromise)
  if (!allPosts.success) return null

  const { data: posts } = allPosts.data

  return (
    <section className="py-4">
      <h2 className="mb-4 text-xl font-semibold">Artigos</h2>
      {!posts.length && (
        <p className="text-muted-foreground text-sm">
          Nenhum artigo foi encontrado.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, i) => (
          <Link key={String(i)} href={`/posts/${post.slug}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md pt-0">
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={post.featuredImage || '/placeholder.svg'}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(post.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="secondary">
                  {post.subcategory.category.name}
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
