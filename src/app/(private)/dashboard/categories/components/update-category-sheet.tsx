'use client'
import { updateCategory } from '@/actions/blog/category/update-caterory'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { CategoryForm } from './category-form'

interface UpdateCategorySheetProps {
  id: string
  slug: string
  description: string
  name: string
}

export function UpdateCategorySheet({ id, ...rest }: UpdateCategorySheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Atualizar categoria</SheetTitle>
        </SheetHeader>
        <main className="px-4">
          <CategoryForm
            defaultValues={rest}
            onSubmit={async (data) => {
              toast.loading('Atualizando categoria...')
              const res = await updateCategory(id, data)

              toast.dismiss()

              if (!res.success) {
                toast.error(res.error)
                return
              }

              toast.success('Categoria atualizada!')
              router.refresh()
              setOpen(false)
            }}
          />
        </main>
      </SheetContent>
    </Sheet>
  )
}
