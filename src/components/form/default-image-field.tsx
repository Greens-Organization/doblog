import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'

interface DefaultImageField {
  type: React.ComponentProps<'input'>['type']
  name: string
  defaultValue: string
  description: string
  placeholder: string
  label: string
  disabled: boolean
}

export function DefaultImageField({
  description = '',
  label = '',
  name = '',
  placeholder = '',
  disabled = false
}: Partial<DefaultImageField>) {
  const form = useFormContext()

  const nonSupportImage = [
    'http',
    'doblog-thumb-placeholder',
    'doblog-post-placeholder'
  ]

  function imageIsSupported(url: string) {
    return nonSupportImage.some((v) => url.includes(v))
  }

  return (
    <FormField
      defaultValue=""
      control={form.control}
      disabled={disabled}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              value={imageIsSupported(field.value) ? '' : field.value}
              type="file"
              accept="image/*"
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
