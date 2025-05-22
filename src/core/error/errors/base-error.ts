export class BaseError extends Error {
  public readonly statusCode: number
  public readonly name: string

  constructor(message: string, statusCode = 500, name = 'BaseError') {
    super(message)
    this.name = name
    this.statusCode = statusCode
  }
}
