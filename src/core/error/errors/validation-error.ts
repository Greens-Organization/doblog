import { BaseError } from './base-error'

export class ValidationError extends BaseError {
  constructor(message = 'Validation Failed', statusCode = 422) {
    super(message, statusCode, 'ValidationError', 'VALIDATION')
  }
}
