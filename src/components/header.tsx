'use client'
import { useSession } from '@/infra/lib/better-auth/auth-client'
import Link from 'next/link'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Categorias', href: '/categories' },
  { label: 'FAQ', href: '/#faq' }
] as const

export function Header() {
  const { data: session, isPending } = useSession()

  return (
    <header className="border-b">
      <div className="container px-3 flex justify-between mx-auto h-16 items-center">
        <Link href="/">
          <svg
            width="24"
            height="24"
            viewBox="0 0 534 667"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>doblog</title>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M266.667 0C199.433 0 137.133 9.66666 90.4667 26.3333C67.2667 34.6333 46.1333 45.2667 30.1333 58.7667C14.3333 72.1 0 91.5333 0 116.667V550C0 575.133 14.3333 594.567 30.1667 607.9C46.1333 621.4 67.2667 632.033 90.4667 640.333C137.133 657 199.467 666.667 266.667 666.667C333.9 666.667 396.2 657 442.867 640.333C466.067 632.033 487.2 621.4 503.2 607.9C519 594.567 533.333 575.133 533.333 550V116.667C533.333 91.5333 519 72.1 503.167 58.7667C487.2 45.2667 466.067 34.6333 442.867 26.3333C396.2 9.66666 333.867 0 266.667 0ZM73.1667 109.667C66.1333 115.667 66.1333 117.667 73.1667 123.667C80.8333 130.1 93.8333 137.4 112.9 144.2C150.667 157.7 205 166.667 266.667 166.667C328.333 166.667 382.667 157.667 420.433 144.2C439.467 137.4 452.5 130.1 460.167 123.633C467.2 117.667 467.2 115.633 460.167 109.7C452.5 103.233 439.5 95.9333 420.433 89.1333C382.667 75.6333 328.333 66.6667 266.667 66.6667C205 66.6667 150.667 75.6667 112.9 89.1333C93.8667 95.9333 80.8333 103.2 73.1667 109.667Z"
              fill="var(--foreground)"
            />
          </svg>
        </Link>

        <nav>
          <ul className="flex gap-3">
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className="text-sm font-medium text-primary hover:text-primary/80 duration-150"
              >
                {link.label}
              </Link>
            ))}
          </ul>
        </nav>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-primary hover:text-primary/80 duration-150"
        >
          {isPending ? '' : session?.user.name.split(' ')[0]}
        </Link>
      </div>
    </header>
  )
}
