import path from 'node:path'
import { isDevelopment } from '@/env'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: { position: 'bottom-right' },
  experimental: {
    nodeMiddleware: true
  },
  images: {
    remotePatterns: [
      { hostname: 'api.dicebear.com' },
      { hostname: 'localhost' }
    ]
  },
  logging: {
    fetches: {
      fullUrl: isDevelopment
    }
  },
  turbopack: {
    root: path.join(__dirname, '..')
  }
}

export default nextConfig
