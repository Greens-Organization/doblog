import { BaseError, type ErrorOptions } from './base-error'

export class CustomSyntaxError extends BaseError {
  constructor(
    message = 'wrong or malformed code syntax',
    {
      statusCode = 400,
      name = 'SyntaxError',
      code = 'SYNTAX'
    }: ErrorOptions = {}
  ) {
    super(message, { statusCode, name, code })
  }
}
