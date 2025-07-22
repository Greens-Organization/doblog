import type { IAuthSessionDTO } from '@/core/auth/session/dto'

export function checkIsEditor(session: IAuthSessionDTO): boolean {
  if (!session || !session.user) {
    return false
  }

  const result = ['editor'].includes(session.user.role)
  return result
}
