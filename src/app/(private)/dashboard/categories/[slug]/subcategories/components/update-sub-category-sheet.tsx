'use client'
import {
  deleteSubCategory,
  updateSubCategory
} from '@/actions/blog/subcategory'
import { DeleteButton } from '@/components/buttons'
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
import { CategoryForm } from '../../../components/category-form'

interface UpdateSubCategoryProps {
  id: string
  slug: string
  description: string
  name: string
}

export function UpdateSubCategory({ id, ...rest }: UpdateSubCategoryProps) {
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
          <SheetTitle>Atualizar Subcategoria</SheetTitle>
        </SheetHeader>
        <main className="px-4 grid gap-3">
          <CategoryForm
            submitLabel="Atualizar"
            defaultValues={rest}
            onSubmit={async (data) => {
              toast.loading('Atualizando subcategoria...')
              const res = await updateSubCategory(id, data)

              toast.dismiss()

              if (!res.success) {
                toast.error(res.error)
                return
              }

              toast.success('Subcategoria atualizada!')
              router.refresh()
              setOpen(false)
            }}
          />
          <DeleteButton
            action={async () => {
              toast.loading('Deletando subcategoria...')
              const res = await deleteSubCategory(id)

              toast.dismiss()

              if (!res.success) {
                toast.error(res.error)
                return
              }
              toast.success('Subcategoria deletada!')
              setOpen(false)
              router.refresh()
            }}
          />
        </main>
      </SheetContent>
    </Sheet>
  )
}
