import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import type { Option } from '../ui/multiselect'
import MultipleSelector from '../ui/multiselect'

interface DefaultMultiSelector {
  name: string
  defaultValue: string
  description: string
  placeholder: string
  label: string
  values: Option[]
}

export function DefaultMultiSelector({
  defaultValue = '',
  description = '',
  label = '',
  name = '',
  placeholder = '',
  values = []
}: Partial<DefaultMultiSelector>) {
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
            <MultipleSelector
              commandProps={{ label }}
              value={field.value}
              defaultOptions={values}
              placeholder={placeholder}
              hidePlaceholderWhenSelected
              emptyIndicator={
                <p className="text-center text-sm">No results found</p>
              }
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
