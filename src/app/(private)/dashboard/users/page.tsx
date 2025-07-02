import { listUsers } from '@/actions/dashboard/user'
import { DefaultError } from '@/components/errors'
import { SearchFilter } from '@/components/filters'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DashNavbar } from '../components/dash-navbar'
import { InviteUser } from './invite-user'
import { UsersTableRow } from './users-table-row'

interface PageProps {
  searchParams: Promise<{ name?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const search = await searchParams
  const usersRes = await listUsers({ name: search.name })

  if (!usersRes.success) {
    return (
      <DefaultError description={usersRes.error} status={usersRes.status} />
    )
  }

  const { data: users } = usersRes.data

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
          <SearchFilter name="name" placeholder="Pesquisar usuários..." />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Publicações</TableHead>
                <TableHead>Rascunhos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                if (user.email === 'anonymous') return null
                return <UsersTableRow user={user} key={user.id} />
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
