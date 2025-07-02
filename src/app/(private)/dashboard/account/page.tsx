import { Separator } from '@/components/ui/separator'
import { DashNavbar } from '../components/dash-navbar'
import { AccountForm } from './account-form'

export default function Page() {
  return (
    <section>
      <DashNavbar
        navigation={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Account', href: '/dashboard/account' }
        ]}
      />
      <main className="p-4 space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </div>
        <Separator />
        <AccountForm />
      </main>
    </section>
  )
}
