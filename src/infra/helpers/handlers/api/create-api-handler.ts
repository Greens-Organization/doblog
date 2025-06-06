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
        const value = result.value as any
        const responseBody =
          value && typeof value === 'object' && 'body' in value
            ? value.body
            : value
        const statusCode =
          value && typeof value === 'object' && 'statusCode' in value
            ? value.statusCode
            : 200
        return new Response(JSON.stringify(responseBody), {
          status: statusCode,
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
