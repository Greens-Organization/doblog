import { logger } from '@/infra/lib/logger/logger-server'
import { APIError } from 'better-auth/api'
import { ZodError } from 'zod/v4'
import { BetterAuthError } from '../custom'
import { DatabaseError, ValidationError } from '../errors'
import { UnknownError } from '../errors/unknown-error'

function isDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const dbErrorNames = [
    'PostgresError',
    'SqliteError',
    'MysqlError',
    'DatabaseError'
  ]

  // @ts-ignore
  return dbErrorNames.includes(error.constructor?.name)
}

export function serviceHandleError(error: unknown, origin = 'Unknown origin') {
  if (error instanceof ZodError) {
    logger.error(
      `ValidationError (${origin}):`,
      error.issues.map((e) => e.message).join('; ')
    )
    return new ValidationError(error.issues.map((e) => e.message).join('; '))
  }

  if (error instanceof APIError) {
    logger.error(`BetterAuthError (${origin}):`, error, error.body?.message)
    return new BetterAuthError(error)
  }

  if (error instanceof DatabaseError || isDatabaseError(error)) {
    logger.error(`DatabaseError (${origin}): `, error)
    return error instanceof DatabaseError
      ? error
      : new DatabaseError(error instanceof Error ? error.message : undefined)
  }

  logger.error(`Unhandled error in service (${origin}):`, error)
  return new UnknownError()
}
