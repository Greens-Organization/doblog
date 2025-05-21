import { auth } from '@/infra/lib/better-auth/auth'
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { apiAuthMiddleware, appAuthMiddleware } from './infra/middleware/auth/'

const prefixApi = '/api/v1'

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith(prefixApi)

  if (isApiRoute) {
    return apiAuthMiddleware(request, session)
  }

  return appAuthMiddleware(request, session)
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
}
