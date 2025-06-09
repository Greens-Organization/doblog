import { logger } from 'better-auth'
import { APIError } from 'better-auth/api'
import { ZodError } from 'zod/v4'
import { BetterAuthError } from '../custom'
import { DatabaseError, ValidationError } from '../errors'

export function serviceHandleError(error: unknown, origin = 'Unknown origin') {
  if (error instanceof ZodError) {
    return new ValidationError(error.issues.map((e) => e.message).join('; '))
  }

  if (error instanceof APIError) {
    return new BetterAuthError(error)
  }

  logger.error(`Unhandled error in service (${origin}):`, error)
  return new DatabaseError()
}
