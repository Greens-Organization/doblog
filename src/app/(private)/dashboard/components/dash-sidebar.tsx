'use client'
import { FileText, FolderTree, Home, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useSession } from '@/infra/lib/better-auth/auth-client'
import { NavUser } from './nav-user'

const editorItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },
  {
    title: 'Posts',
    url: '/dashboard/posts',
    icon: FileText
  }
]

const adminItems = [
  ...editorItems,
  {
    title: 'Categories',
    url: '/dashboard/categories',
    icon: FolderTree
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users
  }
]

export function DashSidebar() {
  const { data, isPending } = useSession()

  const items = isPending
    ? []
    : data?.user.role === 'admin'
      ? adminItems
      : editorItems

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
