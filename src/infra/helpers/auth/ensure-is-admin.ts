import type { IAuthSessionDTO } from '@/core/auth/session/dto'
import { UserRole } from '@/core/blog/user/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { UnauthorizedError } from '@/core/error/errors'

export function ensureIsAdmin(session: IAuthSessionDTO): AppEither<true> {
  if (!session) {
    return left(new UnauthorizedError('Session not found'))
  }

  if (session.user.role !== UserRole.ADMIN) {
    return left(new UnauthorizedError('Access denied: Admins only'))
  }

  return right(true)
}
