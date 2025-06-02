import { isDevelopment } from '@/env'
import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  devIndicators: { position: 'bottom-right' },
  experimental: {
    nodeMiddleware: true
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
