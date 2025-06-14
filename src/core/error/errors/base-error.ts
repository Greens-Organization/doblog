export interface ErrorOptions {
  statusCode?: number
  name?: string
  code?: string
}

export class BaseError extends Error {
  public readonly statusCode: number
  public readonly name: string
  public readonly code?: string

  constructor(
    message: string | undefined,
    { statusCode = 500, name = 'BaseError', code }: ErrorOptions
  ) {
    super(message)
    this.name = name
    this.statusCode = statusCode
    this.code = code
  }
}
