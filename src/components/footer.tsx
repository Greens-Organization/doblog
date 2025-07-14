'use client'
import { useSession } from '@/infra/lib/better-auth/auth-client'
import Link from 'next/link'

export function Footer() {
  const { isPending, data: session } = useSession()

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto">
        <div className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} doblog. All rights reserved.
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/dashboard">
            {isPending ? '' : 'My Account'}
            {!isPending && session?.user ? '' : 'Login'}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
