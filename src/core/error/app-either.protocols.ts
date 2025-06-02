import type { Either } from './either'
import type { BaseError } from './errors/base-error'

export type AppEither<R> = Either<
  BaseError,
  { body: R; statusCode?: number } | R
>
