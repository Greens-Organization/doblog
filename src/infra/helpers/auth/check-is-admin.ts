import type { IAuthSessionDTO } from '@/core/auth/session/dto'

export function checkIsAdmin(session: IAuthSessionDTO): boolean {
  if (!session || !session.user) {
    return false
  }

  const result = ['admin', 'owner'].includes(session.user.role)
  return result
}
