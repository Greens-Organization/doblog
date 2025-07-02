'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

interface SelectFilterProps {
  name: string
  values: Array<{ key: string; value: string }>
  placeholder?: string
  defaultValue?: string
}

export function SelectFilter({
  defaultValue = '',
  placeholder,
  name,
  values
}: SelectFilterProps) {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get(name) || defaultValue
  const [value, setValue] = useState(searchParams.get(name) || defaultValue)

  const router = useRouter()

  useEffect(() => {
    if (value === urlQuery) return
    const newParams = new URLSearchParams(searchParams)

    if (value !== defaultValue) {
      newParams.set(name, value)
    } else {
      newParams.delete(name)
    }

    router.push(`?${newParams.toString()}`)
  })

  return (
    <Select defaultValue={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {values.map((v, i) => (
          <SelectItem value={v.value} key={String(i)}>
            {v.key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
