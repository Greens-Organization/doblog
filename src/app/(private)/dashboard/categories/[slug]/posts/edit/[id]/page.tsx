'use client'

import { DashNavbar } from '@/app/(private)/dashboard/components/dash-navbar'
import { Markdown } from '@/components/markdown'
import { MarkdownEditor } from '@/components/markdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { useState } from 'react'

export default function EditPostPage() {
  const [title, setTitle] = useState('Example title')
  const [subtitle, setSubtitle] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A provident eius aperiam rerum eos exercitationem earum voluptate possimus.'
  )
  const [content, setContent] = useState('# Hello world')

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Postagens', href: '/dashboard/posts' },
          { label: 'Editar', href: '/dashboard/posts/edit/1' }
        ]}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="head-text-sm">Editar postagem</h1>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Digite o título da postagem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                placeholder="Digite o subtítulo da postagem"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Tabs defaultValue="editor">
                <TabsList className="mb-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Visualização</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-0">
                  <MarkdownEditor value={content} onChange={setContent} />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[300px] rounded-md border p-4">
                    {content ? (
                      <Markdown content={content} />
                    ) : (
                      <p className="text-muted-foreground">
                        A visualização aparecerá aqui...
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="draft">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria Principal</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="negocios">Negócios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategorias</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desenvolvimento-web">
                    Desenvolvimento Web
                  </SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="inteligencia-artificial">
                    Inteligência Artificial
                  </SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="cloud-computing">
                    Cloud Computing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Imagem de Capa</Label>
              <div className="flex items-center gap-2">
                <Input id="image" type="file" accept="image/*" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="titulo-da-postagem" />
              <p className="text-xs text-muted-foreground">
                URL amigável para a postagem. Deixe em branco para gerar
                automaticamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea
                id="excerpt"
                placeholder="Digite um breve resumo da postagem"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
