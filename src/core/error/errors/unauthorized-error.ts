import { BaseError, type ErrorOptions } from './base-error'

export class UnauthorizedError extends BaseError {
  constructor(
    message = 'Unauthorized',
    {
      statusCode = 401,
      name = 'UnauthorizedError',
      code = 'UNAUTHORIZED'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
