'use client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

interface Link {
  label: string
  href: string
}

interface DashNavbarProps {
  navigation: Link[]
}

export function DashNavbar({ navigation }: DashNavbarProps) {
  return (
    <header className="border-b p-3 gap-4 flex items-center h-fit">
      <SidebarTrigger />
      <nav>
        <Breadcrumb>
          <BreadcrumbList>
            {navigation.map((link, index) => (
              <React.Fragment key={link.href}>
                <PageNavigationItem href={link.href} content={link.label} />
                {index < navigation.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </nav>
    </header>
  )
}

function PageNavigationItem(props: { href: string; content: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = `${pathname}?${searchParams.toString()}` === props.href

  if (isActive) {
    return (
      <BreadcrumbItem>
        <BreadcrumbPage>{props.content}</BreadcrumbPage>
      </BreadcrumbItem>
    )
  }
  return (
    <BreadcrumbItem>
      <BreadcrumbLink
        href={props.href}
        data-umami-event="go-page"
        data-umami-event-source="breadcrumb-link"
        data-umami-event-page={props.href}
      >
        {props.content}
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}
