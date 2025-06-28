'use client'

import { deleteUser } from '@/actions/dashboard/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import type { IUserDTO } from '@/core/blog/user/dto'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function UsersTableRow({ user }: { user: IUserDTO }) {
  const router = useRouter()

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
          <Button size="sm" variant="secondary">
            <Link href={`/dashboard/users/edit/${user.id}`}>Edit</Link>
          </Button>
          <Button
            size="sm"
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
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
