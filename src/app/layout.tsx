import '@/styles/globals.css'
import { getConfig } from '@/actions/blog/config'
import RootProviders from '@/components/providers'
import { siteConfig } from '@/config/site.config'
import { fontHeading, fontMono, fontSans } from '@/infra/lib/fonts'
import { cn } from '@/infra/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  icons: {
    icon: '/goku.svg',
    shortcut: '/goku.svg'
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.origin,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.og,
        width: 2880,
        height: 1800,
        alt: siteConfig.name
      }
    ],
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.socials.x,
    title: siteConfig.title,
    description: siteConfig.description,
    images: {
      url: siteConfig.og,
      width: 2880,
      height: 1800,
      alt: siteConfig.name
    }
  }
}

interface Layout {
  children: React.ReactNode
}

export default function RootLayout({ children }: Layout) {
  const config = getConfig()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
      >
        <RootProviders configPromise={config}>{children}</RootProviders>
      </body>
    </html>
  )
}
