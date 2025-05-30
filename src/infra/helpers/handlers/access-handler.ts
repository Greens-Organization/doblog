import type { UserRole } from '@/core/blog/user/dto'

export class AccessHandler {
  static hasAccessByRole(
    userRole: UserRole | string | null | undefined,
    requiredRoles: string[] | undefined
  ): boolean {
    if (!userRole) {
      return false
    }
    if (!requiredRoles) {
      return false
    }
    return requiredRoles.includes(userRole)
  }
}
