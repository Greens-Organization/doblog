import type { Session, User } from 'better-auth'
import { type NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/sign-in']

export function appAuthMiddleware(
  request: NextRequest,
  session: { session: Session; user: User } | null
) {
  const { pathname } = request.nextUrl

  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // If user is authenticated but trying to access auth routes
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
