import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  DatabaseError,
  NotFoundError,
  ValidationError
} from '@/core/error/errors'
import { db } from '@/infra/db'
import type { DCategory, DPost, DSubcategory } from '@/infra/db/schemas/blog'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { logger } from '@/infra/lib/logger/logger-server'
import { and, count, eq } from 'drizzle-orm'
import { z } from 'zod/v4'

const searchParamsSchema = z
  .object({
    category_slug: z.string().optional(),
    subcategory_slug: z.string().optional(),
    page: z.coerce.number().optional().default(1),
    per_page: z.coerce.number().optional().default(25)
  })
  .refine(
    (data) =>
      (data.category_slug && !data.subcategory_slug) ||
      (!data.category_slug && data.subcategory_slug),
    { message: 'Provide either category_slug or subcategory_slug, not both.' }
  )

interface ResponseDTO {
  category: DCategory
  subcategory: DSubcategory
  posts: DPost[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export async function listPostsByCategoryOrSubcategory(
  request: Request
): Promise<AppEither<ResponseDTO>> {
  try {
    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      category_slug: url.searchParams.get('category_slug') ?? undefined,
      subcategory_slug: url.searchParams.get('subcategory_slug') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      per_page: url.searchParams.get('per_page') ?? undefined
    })

    const page = params.page
    const perPage = params.per_page
    const offset = (page - 1) * perPage

    if (!params.category_slug && !params.subcategory_slug) {
      return left(
        new ValidationError(
          'Either category_slug or subcategory_slug must be provided'
        )
      )
    }

    let categoryData: DCategory
    let subcategoryData: DSubcategory

    if (params.category_slug) {
      const [categoryResult] = await db
        .select()
        .from(category)
        .where(eq(category.slug, params.category_slug))
        .limit(1)

      if (!categoryResult) {
        return left(new NotFoundError('Category not found'))
      }

      const [subcategoryResult] = await db
        .select()
        .from(subcategory)
        .where(
          and(
            eq(subcategory.categoryId, categoryResult.id),
            eq(subcategory.isDefault, true)
          )
        )
        .limit(1)

      if (!subcategoryResult) {
        return left(
          new NotFoundError('Default Subcategory not found for this Category')
        )
      }

      categoryData = categoryResult
      subcategoryData = subcategoryResult
    } else {
      const [subcategoryResult] = await db
        .select()
        .from(subcategory)
        .where(eq(subcategory.slug, params.subcategory_slug!))
        .limit(1)

      if (!subcategoryResult) {
        return left(new NotFoundError('Subcategory not found'))
      }

      const [categoryResult] = await db
        .select()
        .from(category)
        .where(eq(category.id, subcategoryResult.categoryId))
        .limit(1)

      if (!categoryResult) {
        return left(
          new NotFoundError('Category not found for this Subcategory')
        )
      }

      categoryData = categoryResult
      subcategoryData = subcategoryResult
    }

    const totalQuery = await db
      .select({ count: count() })
      .from(post)
      .where(
        and(
          eq(post.subcategoryId, subcategoryData!.id),
          eq(post.status, 'published')
        )
      )

    const total = totalQuery[0].count
    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    const posts = await db
      .select()
      .from(post)
      .where(
        and(
          eq(post.subcategoryId, subcategoryData.id),
          eq(post.status, 'published')
        )
      )
      .limit(perPage)
      .offset(offset)

    return right({
      category: categoryData,
      subcategory: subcategoryData,
      posts,
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return left(
        new ValidationError(error.issues.map((e) => e.message).join('; '))
      )
    }

    logger.error('DB error in listPostsByCategoryOrSubcategory:', error)
    return left(new DatabaseError())
  }
}
