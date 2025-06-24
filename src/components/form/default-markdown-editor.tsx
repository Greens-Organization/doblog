import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import { Markdown } from '../markdown'
import { MarkdownEditor } from '../markdown-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface DefaultFieldProps {
  name: string
  defaultValue: string
  description: string
  label: string
}

export function DefaultMarkdownEditor({
  defaultValue = '',
  description = '',
  label = '',
  name = ''
}: Partial<DefaultFieldProps>) {
  const form = useFormContext()
  return (
    <FormField
      defaultValue={defaultValue}
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Tabs defaultValue="editor">
              <TabsList className="mb-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Visualização</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-0">
                <MarkdownEditor value={field.value} onChange={field.onChange} />
              </TabsContent>
              <TabsContent value="preview" className="mt-0">
                <div className="min-h-[300px] rounded-md border p-4">
                  {field.value ? (
                    <Markdown content={field.value} />
                  ) : (
                    <p className="text-muted-foreground">
                      A visualização aparecerá aqui...
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
