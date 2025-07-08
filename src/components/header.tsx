'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useConfig } from './providers/config-provider'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Categorias', href: '/categories' }
] as const

const loaderProp = ({ src }: { src: string }) => {
  return src
}

export function Header() {
  const { config } = useConfig()

  return (
    <header className="border-b">
      <div className="container px-3 flex justify-between mx-auto h-16 items-center">
        <Link href="/">
          {config.logo ? (
            <Image
              className="rounded-full hover:blur-xs duration-300"
              loader={loaderProp}
              src={config.logo}
              width={40}
              height={40}
              alt={config.name}
            />
          ) : (
            <span className="font-medium">Inicio</span>
          )}
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
      </div>
    </header>
  )
}
