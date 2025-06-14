import { logger } from '@/infra/lib/logger/logger-server'
import { APIError } from 'better-auth/api'
import { ZodError } from 'zod/v4'
import { BetterAuthError } from '../custom'
import {
  CustomSyntaxError,
  DatabaseError,
  UnknownError,
  ValidationError
} from '../errors'

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
  if (error instanceof SyntaxError) {
    logger.error(`SyntaxError (${origin}):`, error.message, error.stack)
    return new CustomSyntaxError(error.message)
  }

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
    return new DatabaseError()
  }

  logger.error(`Unhandled error in service (${origin}):`, error)
  return new UnknownError()
}
