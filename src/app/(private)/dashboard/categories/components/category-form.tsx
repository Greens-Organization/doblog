'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string()
})

type Schema = z.infer<typeof schema>

interface CategoryFormProps {
  onSubmit: (data: Schema) => void
  defaultValues?: Partial<Schema>
  submitLabel?: string
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Adicionar'
}: CategoryFormProps) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <FormField
          control={form.control}
          name="name"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input id="name" placeholder="Marketing Digital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input id="slug" placeholder="marketing-digital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  id="slug"
                  placeholder="URL descrevendo a categoria."
                  className="resize-none"
                  rows={12}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting}>{submitLabel}</Button>
      </form>
    </Form>
  )
}
