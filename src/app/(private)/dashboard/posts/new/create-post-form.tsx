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

import type { listCategories } from '@/actions/dashboard/category'
import {
  createSignedURL,
  uploadThumbnail
} from '@/actions/dashboard/posts/thumbnail'
import type { SuccessData } from '@/actions/types'
import { createPostSchema } from '@/infra/validations/schemas/post'
import { useRef } from 'react'

interface CreatePostFormProps {
  categories: SuccessData<typeof listCategories>
}

export function CreatePostForm({ categories }: CreatePostFormProps) {
  const action = useRef<'CREATE' | 'CREATE-AND-UPDATE'>('CREATE')
  const form = useForm({
    resolver: zodResolver(createPostSchema())
  })

  const { data: listCategories } = categories

  const category = form.watch('category_slug')

  const subcategories =
    listCategories.find((c) => c.slug === category)?.subcategory || []

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={form.handleSubmit(async (data) => {
          const file = document.querySelector("input[type='file']")
          const fileType = data.featured_image?.split('.').at(-1) as string

          // @ts-ignore
          const imageRaw = file?.files?.[0] as File

          const fileName = `${Date.now()}`

          const res1 = await createSignedURL({ fileType, fileName })

          if (!res1.success) {
            toast.error(res1.error)
            return
          }

          const { public_url, url: uploadURL } = res1.data

          const res2 = await uploadThumbnail({
            image: {
              data: imageRaw,
              type: fileType
            },
            url: uploadURL
          })

          if (res2.error) {
            toast.error(res2.error)
            return
          }

          const res = await createPost({
            category_slug: data.category_slug,
            content: data.content,
            excerpt: data.excerpt,
            slug: data.slug,
            subcategory_slug: data.subcategory_slug,
            title: data.title,
            featured_image: public_url
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
              disabled={form.formState.isSubmitting}
              onClick={() => {
                action.current = 'CREATE'
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
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
              values={listCategories.map((c) => ({
                label: c.name,
                value: c.slug
              }))}
            />
            <DefaultSelectField
              name="subcategory_slug"
              label="Subcategoria"
              placeholder="Selecione a subcategoria"
              disabled={!category}
              values={subcategories.map((s) => ({
                label: s.name,
                value: s.slug
              }))}
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
