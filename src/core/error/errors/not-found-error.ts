import { BaseError, type ErrorOptions } from './base-error'

export class NotFoundError extends BaseError {
  constructor(
    message = 'Not Found Data',
    {
      statusCode = 404,
      name = 'NotFoundError',
      code = 'NOT_FOUND'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
