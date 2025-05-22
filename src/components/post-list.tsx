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

interface PostListProps {
  categorySlug?: string
  subCategorySlug?: string
}

// Simulação de posts - em produção, viriam do banco de dados
const getPosts = () => {
  return [
    {
      id: 1,
      title: 'Introdução ao Next.js 14',
      description:
        'Aprenda as novidades do Next.js 14 e como implementar em seus projetos',
      thumbnail: '/placeholder.svg?height=200&width=400',
      author: 'João Silva',
      date: '2023-12-15',
      slug: 'introducao-nextjs-14',
      category: 'tecnologia',
      subCategory: 'desenvolvimento-web'
    },
    {
      id: 2,
      title: 'Tailwind CSS v4: O que esperar',
      description:
        'Conheça as novas funcionalidades e melhorias do Tailwind CSS v4',
      thumbnail: '/placeholder.svg?height=200&width=400',
      author: 'Maria Oliveira',
      date: '2023-12-10',
      slug: 'tailwind-css-v4',
      category: 'tecnologia',
      subCategory: 'desenvolvimento-web'
    },
    {
      id: 3,
      title: 'TypeScript: Dicas para iniciantes',
      description: 'Guia prático para quem está começando com TypeScript',
      thumbnail: '/placeholder.svg?height=200&width=400',
      author: 'Pedro Santos',
      date: '2023-12-05',
      slug: 'typescript-dicas-iniciantes',
      category: 'tecnologia',
      subCategory: 'desenvolvimento-web'
    },
    {
      id: 4,
      title: 'React Server Components explicados',
      description:
        'Entenda como funcionam os Server Components no React e suas vantagens',
      thumbnail: '/placeholder.svg?height=200&width=400',
      author: 'Ana Costa',
      date: '2023-11-28',
      slug: 'react-server-components',
      category: 'tecnologia',
      subCategory: 'desenvolvimento-web'
    }
  ]
}

export function PostList({ categorySlug, subCategorySlug }: PostListProps) {
  const allPosts = getPosts()

  // Filtrar posts por categoria e subcategoria, se fornecidos
  const posts = allPosts.filter((post) => {
    if (categorySlug && post.category !== categorySlug) return false
    if (subCategorySlug && post.subCategory !== subCategorySlug) return false
    return true
  })

  return (
    <section className="py-4">
      <h2 className="mb-4 text-xl font-semibold">Artigos</h2>
      {!posts.length && (
        <p className="text-muted-foreground text-sm">
          Nenhum artigo foi encontrado.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.slug}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md pt-0">
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={post.thumbnail || '/placeholder.svg'}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="secondary">{post.category}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
