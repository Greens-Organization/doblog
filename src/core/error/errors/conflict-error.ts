import { BaseError, type ErrorOptions } from './base-error'

export class ConflictError extends BaseError {
  constructor(
    message = 'Conflict',
    {
      statusCode = 409,
      name = 'ConflictError',
      code = 'CONFLICT'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
