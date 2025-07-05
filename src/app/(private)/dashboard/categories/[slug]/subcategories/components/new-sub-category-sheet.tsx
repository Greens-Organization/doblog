'use client'
import { createSubCategory } from '@/actions/dashboard/subcategory'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { CategoryForm } from '../../../components/category-form'

export function NewSubCategorySheet({
  categorySlug
}: { categorySlug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 size-4" />
          Nova Subcategoria
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Subcategoria</SheetTitle>
        </SheetHeader>
        <main className="px-4">
          <CategoryForm
            onSubmit={async (data) => {
              toast.loading('Criando subcategoria...')

              const res = await createSubCategory({
                category_slug: categorySlug,
                name: data.name,
                slug: data.slug,
                description: data.description
              })

              toast.dismiss()

              if (!res.success) {
                toast.error(res.error)
                return
              }

              toast.success('Subcategoria criada!')
              router.refresh()
              setOpen(false)
            }}
          />
        </main>
      </SheetContent>
    </Sheet>
  )
}
