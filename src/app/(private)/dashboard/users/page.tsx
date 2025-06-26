import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { DashNavbar } from '../components/dash-navbar'
import { InviteUser } from './invite-user'

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'Admin',
      status: 'Ativo',
      lastLogin: '15/12/2023'
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'Editor',
      status: 'Ativo',
      lastLogin: '14/12/2023'
    },
    {
      id: 3,
      name: 'Maria Oliveira',
      email: 'maria@example.com',
      role: 'Editor',
      status: 'Ativo',
      lastLogin: '13/12/2023'
    },
    {
      id: 4,
      name: 'Pedro Santos',
      email: 'pedro@example.com',
      role: 'Editor',
      status: 'Inativo',
      lastLogin: '10/12/2023'
    }
  ]

  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Usuários', href: '/dashboard/users' }
        ]}
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="head-text-sm">Usuários</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie os usuários e suas permissões.
            </p>
          </div>
          <InviteUser />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar usuários..." className="pl-10" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'Admin' ? 'default' : 'secondary'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'Ativo' ? 'outline' : 'destructive'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/edit/${user.id}`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
