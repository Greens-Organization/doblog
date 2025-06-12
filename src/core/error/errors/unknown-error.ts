import { BaseError, type ErrorOptions } from './base-error'

export class UnknownError extends BaseError {
  constructor(
    message = "New bug discovered, let's investigate!",
    {
      statusCode = 500,
      name = 'UnknownError',
      code = 'NEW_ERROR'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
