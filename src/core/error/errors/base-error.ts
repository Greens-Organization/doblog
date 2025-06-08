export class BaseError extends Error {
  public readonly statusCode: number
  public readonly name: string
  public readonly code?: string

  constructor(
    message: string,
    statusCode = 500,
    name = 'BaseError',
    code?: string
  ) {
    super(message)
    this.name = name
    this.statusCode = statusCode
    this.code = code
  }
}
