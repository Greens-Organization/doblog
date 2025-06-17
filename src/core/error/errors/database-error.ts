import { BaseError, type ErrorOptions } from './base-error'
export class DatabaseError extends BaseError {
  constructor(
    message = 'Database Error',
    {
      statusCode = 500,
      name = 'DatabaseError',
      code = 'DATABASE'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
