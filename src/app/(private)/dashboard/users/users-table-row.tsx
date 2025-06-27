'use client'

import { deleteUser } from '@/actions/dashboard/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { IUserDTO } from '@/core/blog/user/dto'
import { MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { UpdateUser } from './update-user'

export function UsersTableRow({ user }: { user: IUserDTO }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>{user.totalPostPublished}</TableCell>
      <TableCell>{user.totalPostDraft}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <UpdateUser user={user}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Editar
                </DropdownMenuItem>
              </UpdateUser>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  toast.loading('Deleting user...')
                  const res = await deleteUser(user.id)
                  toast.dismiss()

                  if (!res.success) {
                    toast.error(res.error)
                    return
                  }
                  toast.success('User deleted.')
                  router.refresh()
                }}
              >
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
