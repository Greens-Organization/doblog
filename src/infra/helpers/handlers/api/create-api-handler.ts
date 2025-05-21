import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, isRight } from '@/core/error/either'
import type { BaseError } from '@/core/error/errors'
import { logger } from 'better-auth'

export function createApiHandler<R>(
  handler: (request: Request) => Promise<AppEither<R>>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const result = await handler(request)
      logger.debug('Handler result:', result)

      if (isLeft(result)) {
        const error = result.value as BaseError

        return new Response(
          JSON.stringify({ error: error.message, type: error.name }),
          {
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (isRight(result)) {
        return new Response(JSON.stringify(result.value), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Unexpected result' }), {
        status: 500
      })
    } catch (err) {
      logger.error('Unhandled API Error:', err)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500
      })
    }
  }
}
