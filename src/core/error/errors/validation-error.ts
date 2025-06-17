import { BaseError, type ErrorOptions } from './base-error'

export class ValidationError extends BaseError {
  constructor(
    message = 'Validation Failed',
    {
      statusCode = 422,
      name = 'ValidationError',
      code = 'VALIDATION'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
