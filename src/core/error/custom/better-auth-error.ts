import type { APIError } from 'better-auth/api'
import { BaseError } from '../errors'

export class BetterAuthError extends BaseError {
  constructor(error: APIError) {
    super(
      error.body?.message ?? 'Unknown error',
      error.statusCode ?? 500,
      'BetterAuthError',
      error.body?.code ?? 'UNKNOWN_CODE'
    )
  }
}
