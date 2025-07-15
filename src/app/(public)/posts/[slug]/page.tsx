import { getPost } from '@/actions/blog/post'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Markdown } from '@/components/markdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SharePost } from './share-post'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params

  const postRes = await getPost(slug)

  if (!postRes.success) return null

  const { data: post } = postRes

  return (
    <section>
      <Header />
      <main className="max-w-3xl mx-auto">
        <article className="py-12">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge asChild>
                  <Link href={`/categories/${post.subcategory.category.slug}`}>
                    {post.subcategory.category.name}
                  </Link>
                </Badge>
                <Badge key={post.subcategory.slug} variant="outline" asChild>
                  <Link
                    href={`/categories/${post.subcategory.category.slug}?sub=${post.subcategory.slug}`}
                  >
                    {post.subcategory.name}
                  </Link>
                </Badge>
              </div>
            </div>
          </div>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage || '/placeholder.svg'}
              alt={post.title}
              width={800}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <Markdown content={post.content} />
          </div>
          <div className="flex gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Avatar>
                <AvatarImage src={post.author.image || ''} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <hgroup>
                <h4 className="text-sm">{post.author.name}</h4>
                <span className="text-muted-foreground text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </hgroup>
            </div>
            <SharePost description={post.excerpt} title={post.title} />
          </div>
        </article>
      </main>
      <Footer />
    </section>
  )
}
