import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

interface DefaultSelectField {
  name: string
  defaultValue: string
  description: string
  placeholder: string
  label: string
  disabled: boolean
  values: DefaultSelectFieldValue[]
}

interface DefaultSelectFieldValue {
  label: string
  value: string
}

export function DefaultSelectField({
  defaultValue = '',
  description = '',
  label = '',
  name = '',
  placeholder = '',
  values = [],
  disabled = false
}: Partial<DefaultSelectField>) {
  const form = useFormContext()
  return (
    <FormField
      defaultValue={defaultValue}
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {values.map((v, i) => (
                  <SelectItem value={v.value} key={String(i)}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
