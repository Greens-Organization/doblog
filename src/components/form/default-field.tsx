import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputPassword } from '@/components/ui/input-password'
import { useFormContext } from 'react-hook-form'

interface DefaultFieldProps {
  type: React.ComponentProps<'input'>['type']
  name: string
  defaultValue: string
  description: string
  placeholder: string
  label: string
  disabled: boolean
}

export function DefaultField({
  type = 'text',
  defaultValue = '',
  description = '',
  label = '',
  name = '',
  placeholder = '',
  disabled = false
}: Partial<DefaultFieldProps>) {
  const form = useFormContext()
  return (
    <FormField
      defaultValue={defaultValue}
      control={form.control}
      disabled={disabled}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            {type === 'password' ? (
              <InputPassword placeholder={placeholder} {...field} />
            ) : (
              <Input placeholder={placeholder} {...field} type={type} />
            )}
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
