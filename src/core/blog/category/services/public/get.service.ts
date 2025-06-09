import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { NotFoundError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { zod } from '@/infra/lib/zod'
import { eq } from 'drizzle-orm'

const pathParamSchema = zod.object({
  slug: zod.string().min(1, 'Slug must be at least 1 character')
})

export async function getCategory(
  request: Request
): Promise<AppEither<Omit<ICategoryDTO, 'id'>>> {
  try {
    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'slug'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          (parsedParam.error as zod.ZodError).issues
            .map((e) => e.message)
            .join('; ')
        )
      )
    }
    const { slug } = parsedParam.data

    const result = await db.query.category.findFirst({
      where: eq(category.slug, slug),
      columns: {
        id: false
      },
      with: {
        subcategory: {
          columns: {
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    if (!result) {
      return left(new NotFoundError('Category not found'))
    }

    return right(result)
  } catch (error) {
    return left(serviceHandleError(error, 'getCategory'))
  }
}
