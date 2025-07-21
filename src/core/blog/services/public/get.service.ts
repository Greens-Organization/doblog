import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { NotFoundError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { user } from '@/infra/db/schemas/auth'
import { and, eq, ne } from 'drizzle-orm'
import type { IBlogDTO } from '../../dto'

export async function getBlogPublic(
  request: Request
): Promise<AppEither<Omit<IBlogDTO, 'id'>>> {
  try {
    const result = await db.query.organization.findFirst({
      columns: {
        id: false
      }
    })

    if (!result) {
      return left(
        new NotFoundError('Blog not created yet', { statusCode: 428 })
      )
    }

    const isExistUser = await db.query.user.findFirst({
      where: and(ne(user.email, 'anonymous'), eq(user.role, 'owner'))
    })

    if (!isExistUser || isExistUser.role !== 'owner') {
      return left(
        new NotFoundError('First user not created yet', { statusCode: 412 })
      )
    }

    return right(result)
  } catch (error) {
    return left(serviceHandleError(error, 'getBlog'))
  }
}
