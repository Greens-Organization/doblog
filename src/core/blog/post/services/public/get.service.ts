import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import type { DPost } from '@/infra/db/schemas/blog'
import { post } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { logger } from '@/infra/lib/logger/logger-server'
import { zod } from '@/infra/lib/zod'
import { and, eq } from 'drizzle-orm'

const pathParamSchema = zod.object({
  slug: zod.uuid('Invalid Post slug')
})

export async function getPostBySlug(
  request: Request
): Promise<AppEither<DPost>> {
  try {
    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'slug'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues
            .map((e: { message: any }) => e.message)
            .join('; ')
        )
      )
    }
    const { slug } = parsedParam.data

    const foundPost = await db.query.post.findFirst({
      where: and(eq(post.slug, slug), eq(post.status, 'published'))
    })

    if (!foundPost) {
      return left(new NotFoundError('Post not found'))
    }

    return right(foundPost)
  } catch (error) {
    logger.error('DB error in getPostBySlug:', error)
    return left(new DatabaseError())
  }
}
