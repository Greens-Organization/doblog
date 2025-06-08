import { BaseError } from './base-error'

export class NotFoundError extends BaseError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NotFoundError', 'NOT_FOUND')
  }
}
