import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { DatabaseError, NotFoundError } from '@/core/error/errors'
import { db } from '@/infra/db'
import { logger } from '@/infra/lib/logger/logger-server'
import type { IBlogDTO } from '../dto'

export async function getBlog(
  request: Request
): Promise<AppEither<Omit<IBlogDTO, 'id'>>> {
  try {
    const result = await db.query.organization.findFirst({
      columns: {
        id: false
      }
    })

    if (!result) {
      return left(new NotFoundError('Blog data not found'))
    }

    return right(result)
  } catch (error) {
    logger.error('DB error in getCategory:', error)
    return left(new DatabaseError())
  }
}
