import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { NotFoundError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
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
    return left(serviceHandleError(error, 'getBlog'))
  }
}
