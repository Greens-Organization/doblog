'use client'
import { useDebounce } from '@/hooks'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'

interface SearchFilterProps {
  name: string
  placeholder: string
  debounceTime?: number
}

export function SearchFilter({
  name = 'q',
  placeholder,
  debounceTime = 350
}: SearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get(name) || ''

  const [url, setURL] = useState(urlQuery)

  const debouncedValue = useDebounce(url, debounceTime)

  useEffect(() => {
    if (urlQuery === debouncedValue) return
    const newParams = new URLSearchParams(searchParams)

    if (debouncedValue) {
      newParams.set(name, debouncedValue)
    } else {
      newParams.delete(name)
    }

    router.replace(`?${newParams.toString()}`)
  }, [debouncedValue, urlQuery, router, name, searchParams])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        placeholder={placeholder}
        className="pl-10"
        value={url}
        onChange={(e) => setURL(e.currentTarget.value)}
        onKeyUp={(e) => setURL(e.currentTarget.value)}
      />
    </div>
  )
}
