import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import { MarkdownEditor } from '../markdown-editor'

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
        <FormItem className="grid gap-3">
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <MarkdownEditor
              value={field.value}
              onChange={field.onChange}
              maxEditorHeight={500}
            />
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
