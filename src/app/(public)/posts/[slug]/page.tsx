import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Markdown } from '@/components/markdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export default function PostPage({ params }: PostPageProps) {
  // Em produção, buscar dados do post pelo slug
  const post = {
    id: 1,
    title: 'Introdução ao Next.js 14',
    subtitle: 'Aprenda as novidades e como implementar em seus projetos',
    content: `
# Introdução ao Next.js 14

Next.js 14 traz várias melhorias significativas e novas funcionalidades que tornam o desenvolvimento de aplicações React ainda mais eficiente.

## Server Components

Os Server Components são uma das principais novidades do Next.js 13 que foram aprimorados na versão 14. Eles permitem renderizar componentes no servidor, reduzindo o JavaScript enviado ao cliente.

\`\`\`jsx
// Este é um Server Component
export default function ServerComponent() {
  return <div>Renderizado no servidor</div>
}
\`\`\`

## Server Actions

As Server Actions permitem executar código no servidor diretamente de componentes cliente, simplificando operações como submissão de formulários.

\`\`\`jsx
// Exemplo de Server Action
export async function submitForm(formData) {
  'use server'
  
  // Processar dados do formulário no servidor
  const name = formData.get('name')
  await saveToDatabase(name)
}
\`\`\`

## Partial Rendering

O Partial Rendering permite atualizar apenas partes específicas da página quando os dados mudam, melhorando significativamente a performance.

## Conclusão

Next.js 14 representa um grande avanço para o framework, tornando-o ainda mais poderoso para desenvolvimento de aplicações web modernas.
    `,
    image: '/placeholder.svg?height=400&width=800',
    author: 'João Silva',
    date: '2023-12-15',
    category: 'Tecnologia',
    subCategories: ['Desenvolvimento Web', 'React', 'JavaScript']
  }

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
            <div className="flex flex-wrap gap-2">
              <Badge>{post.category}</Badge>
              {post.subCategories.map((subCategory) => (
                <Badge key={subCategory} variant="outline">
                  {subCategory}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground">{post.subtitle}</p>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.image || '/placeholder.svg'}
              alt={post.title}
              width={800}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <Markdown content={post.content} />
          </div>
        </article>
      </main>
      <Footer />
    </section>
  )
}
