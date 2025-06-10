import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { NotFoundError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { post } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { zod } from '@/infra/lib/zod'
import { and, eq } from 'drizzle-orm'
import type { IGetPostDTO } from '../../dto'

const pathParamSchema = zod.object({
  slug: zod.string().min(1, 'Slug is required')
})

export async function getPostBySlugPublic(
  request: Request
): Promise<AppEither<IGetPostDTO>> {
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
      where: and(eq(post.slug, slug), eq(post.status, 'published')),
      columns: {
        id: false,
        authorId: false,
        subcategoryId: false
      },
      with: {
        author: {
          columns: {
            name: true,
            image: true
          }
        },
        subcategory: {
          columns: {
            name: true,
            slug: true,
            description: true
          },
          with: {
            category: {
              columns: {
                name: true,
                slug: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!foundPost) {
      return left(new NotFoundError('Post not found'))
    }

    return right(foundPost)
  } catch (error) {
    return left(serviceHandleError(error, 'getPostBySlug'))
  }
}
