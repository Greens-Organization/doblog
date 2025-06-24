import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useFormContext } from 'react-hook-form'

interface DefaultFieldProps {
  rows: number
  name: string
  defaultValue: string
  description: string
  placeholder: string
  label: string
}

export function DefaulTextAreaField({
  rows = 12,
  defaultValue = '',
  description = '',
  label = '',
  name = '',
  placeholder = ''
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
            <Textarea
              placeholder={placeholder}
              {...field}
              rows={rows}
              className="resize-none"
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
