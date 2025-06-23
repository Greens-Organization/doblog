'use client'

import { createPost, publishPost } from '@/actions/dashboard/posts'
import { DefaulTextAreaField } from '@/components/form/defaul-text-area'
import { DefaultField } from '@/components/form/default-field'
import { DefaultMarkdownEditor } from '@/components/form/default-markdown-editor'
import { DefaultSelectField } from '@/components/form/default-select-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import type { listCategories } from '@/actions/blog/category'
import type { SuccessData } from '@/actions/types'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { useRef } from 'react'

interface CreatePostFormProps {
  categories: SuccessData<typeof listCategories>
}

export default function CreatePostForm({ categories }: CreatePostFormProps) {
  const action = useRef<'CREATE' | 'CREATE-AND-UPDATE'>('CREATE')
  const form = useForm({
    resolver: zodResolver(createPostSchema())
  })

  console.log(form.getValues())

  const { data: listCategories } = categories

  const category = listCategories.at(0)

  const subcategories = category?.subcategory
  console.log(subcategories)

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Creating posts')
          console.log(data, form.getValues())
          const res = await createPost({
            category_slug: data.category_slug,
            content: data.content,
            excerpt: data.excerpt,
            slug: data.slug,
            subcategory_slug: data.subcategory_slug,
            title: data.title
          })

          toast.dismiss()
          if (!res.success) {
            toast.error(res.error)
            return
          }

          if (action.current === 'CREATE') {
            toast.success('Post created.')
            form.reset()
            return
          }

          toast.loading('Publishing your post...')
          const published = await publishPost(res.data.id)

          toast.dismiss()
          if (!published.success) {
            toast.error(
              'Error on publish your post but he are created go to posts page to try publish again'
            )
            form.reset()
            return
          }

          toast.success('Post created and published!')
          form.reset()
        })}
      >
        <div className="flex items-center justify-between">
          <h1 className="head-text-sm">Nova postagem</h1>
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="secondary"
              onClick={() => {
                action.current = 'CREATE'
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button
              type="submit"
              onClick={() => {
                action.current = 'CREATE-AND-UPDATE'
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar e publicar
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <DefaultField
              name="title"
              label="Título"
              placeholder="Digite o título da postagem"
            />
            <DefaultMarkdownEditor name="content" label="Conteúdo" />
          </div>
          <div className="space-y-4">
            <DefaultSelectField
              name="category_slug"
              label="Categoria Principal"
              placeholder="Selecione a categoria"
              disabled={true}
              defaultValue={category?.slug}
              values={
                category ? [{ label: category.name, value: category.slug }] : []
              }
            />
            <DefaultSelectField
              name="subcategory_slug"
              label="Subcategoria"
              placeholder="Selecione a subcategoria"
              disabled={!subcategories?.length}
              values={
                subcategories
                  ? subcategories.map((s) => ({ label: s.name, value: s.slug }))
                  : []
              }
            />
            <DefaultField
              name="featured_image"
              label="Imagem de Capa"
              type="file"
            />
            <DefaultField
              name="slug"
              label="Slug"
              type="text"
              placeholder="titulo-da-postagem"
              description="URL amigável para a postagem. Deixe em branco para gerar
									automaticamente."
            />
            <DefaulTextAreaField
              name="excerpt"
              label="Resumo"
              placeholder="Digite um breve resumo da postagem"
              rows={3}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}
