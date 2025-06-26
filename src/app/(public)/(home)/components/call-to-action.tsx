'use client'
import { useConfig } from '@/components/providers/config-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function CallToAction() {
  const { config } = useConfig()

  return (
    <section className="container mx-auto space-y-8 text-center px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to {config.name}
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Find articles, tutorials and tips on a wide range of topics.
        </p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, category or content..."
            className="w-full pl-10"
          />
        </div>
        <Button type="submit">Pesquisar</Button>
      </div>
    </section>
  )
}
