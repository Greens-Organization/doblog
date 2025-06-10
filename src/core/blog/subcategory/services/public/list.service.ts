import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category, subcategory } from '@/infra/db/schemas/blog'
import { zod } from '@/infra/lib/zod'
import { and, eq } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../../dto'

const searchParamsSchema = zod.object({
  slug: zod.string().optional(),
  name: zod.string().optional(),
  categorySlug: zod.string().optional()
})

export async function listSubcategoriesPublic(
  request: Request
): Promise<AppEither<Omit<ISubcategoryDTO, 'id'>[]>> {
  try {
    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      slug: url.searchParams.get('slug') ?? undefined,
      name: url.searchParams.get('name') ?? undefined,
      categorySlug: url.searchParams.get('categorySlug') ?? undefined,
      withDefault: url.searchParams.get('withDefault') ?? undefined
    })

    const filters = []

    if (params.slug) {
      filters.push(eq(subcategory.slug, params.slug))
    }

    if (params.name) {
      filters.push(eq(subcategory.name, params.name))
    }

    if (params.categorySlug) {
      const categoryFilter = await db.query.category.findFirst({
        where: eq(category.slug, params.categorySlug)
      })
      if (!categoryFilter) {
        return left(new ValidationError('Category slug not found'))
      }
      filters.push(eq(subcategory.categoryId, categoryFilter.id))
    }

    // const result = await db.select().from(subcategory).where(whereClause)
    const result = await db.query.subcategory.findMany({
      where: and(eq(subcategory.isDefault, false), ...filters),
      columns: {
        categoryId: false,
        isDefault: false,
        id: false
      },
      with: {
        category: {
          columns: {
            id: false,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    //TODO: add total quantity of items in each category
    return right(result)
  } catch (error) {
    return left(serviceHandleError(error, 'listSubcategories'))
  }
}
