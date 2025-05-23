import { SidebarProvider } from '@/components/ui/sidebar'
import { DashSidebar } from './components/dash-sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashSidebar />
      <div className="w-full h-screen">{children}</div>
    </SidebarProvider>
  )
}
