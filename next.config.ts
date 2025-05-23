import { isDevelopment } from '@/env'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: { position: 'bottom-right' },
  experimental: {
    nodeMiddleware: true
  },
  logging: {
    fetches: {
      fullUrl: isDevelopment
    }
  }
}

export default nextConfig
