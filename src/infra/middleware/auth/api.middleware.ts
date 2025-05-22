import type { Session, User } from 'better-auth'
import { type NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/blog']
const authRoutes = ['/sign-in']

export function apiAuthMiddleware(
  request: NextRequest,
  session: { session: Session; user: User } | null
) {
  const { pathname } = request.nextUrl

  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.json({ error: 'not authorized' }, { status: 403 })
  }

  // If user is authenticated but trying to access auth routes
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }
}
