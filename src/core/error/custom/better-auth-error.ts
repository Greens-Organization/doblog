import type { APIError } from 'better-auth/api'
import { BaseError } from '../errors'

export class BetterAuthError extends BaseError {
  constructor(error: APIError) {
    super(error.body?.message ?? 'Unauthorized error', {
      statusCode: error.statusCode ?? 500,
      name: 'AuthError',
      code:
        (typeof error.status === 'string'
          ? error.status
          : error.status !== undefined
            ? String(error.status)
            : undefined) ||
        error.body?.code ||
        'UNKNOWN_CODE'
    })
  }
}
