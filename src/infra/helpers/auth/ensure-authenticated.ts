import type { IAuthSessionDTO } from '@/core/auth/session/dto'
import { type Either, left, right } from '@/core/error/either'
import { type BaseError, UnauthorizedError } from '@/core/error/errors'
import { auth } from '@/infra/lib/better-auth/auth'

export async function ensureAuthenticated(
  request: Request
): Promise<Either<BaseError, IAuthSessionDTO>> {
  const session = await auth.api.getSession({
    headers: request.headers
  })
  if (!session) {
    return left(new UnauthorizedError('Session not found'))
  }
  return right(session as IAuthSessionDTO)
}
