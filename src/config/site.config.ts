import { env } from '@/env'
import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'Doblog',
  title: 'Doblog - Self-Hosted Blog for Organizations',
  description:
    'A self-hosting blog platform for enterprises and organizations, designed to streamline the creation, management, and sharing of institutional content securely and with full customization.',
  origin: env.BETTER_AUTH_URL,
  keywords: [
    'Self-hosting blog',
    'Enterprise blog platform',
    'Institutional content management',
    'Organizational communication tool',
    'Corporate blog solution',
    'Secure content sharing',
    'Greens Group',
    'Doblog'
  ],
  og: 'https://',
  creator: {
    name: 'Greens Group',
    url: 'https://grngroup.net'
  },
  socials: {
    github: 'https://github.com/Greens-Organization/doblog',
    x: ''
  }
}
