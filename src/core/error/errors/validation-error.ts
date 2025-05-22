import { BaseError } from './base-error'

export class ValidationError extends BaseError {
  constructor(message = 'Validation Failed') {
    super(message, 422, 'ValidationError')
  }
}
