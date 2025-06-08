import { BaseError } from './base-error'

export class DatabaseError extends BaseError {
  constructor(message = 'Database Error') {
    super(message, 500, 'DatabaseError', 'DATABASE')
  }
}
