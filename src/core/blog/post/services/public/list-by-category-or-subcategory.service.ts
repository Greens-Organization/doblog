import type { IPublicCategoryDTO } from '@/core/blog/category/dto'
import type { IPublicSubcategoryDTO } from '@/core/blog/subcategory/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { NotFoundError, ValidationError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category, post, subcategory } from '@/infra/db/schemas/blog'
import { zod } from '@/infra/lib/zod'
import { and, count, eq, inArray } from 'drizzle-orm'
import type { IGetPublishedPostDTO } from '../../dto'

const searchParamsSchema = zod
  .object({
    category_slug: zod.string().optional(),
    subcategory_slug: zod.string().optional(),
    page: zod.coerce.number().min(1).optional().default(1),
    per_page: zod.coerce.number().min(1).optional().default(25)
  })
  .refine(
    (data: { category_slug?: string; subcategory_slug?: string }) =>
      (data.category_slug && !data.subcategory_slug) ||
      (!data.category_slug && data.subcategory_slug),
    { message: 'Provide either category_slug or subcategory_slug, not both.' }
  )

interface ResponseDTO {
  category: IPublicCategoryDTO
  subcategories: IPublicSubcategoryDTO[]
  data: IGetPublishedPostDTO[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export async function listPostsByCategoryOrSubcategoryPublic(
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

    const page = params.page ?? 1
    const perPage = params.per_page ?? 25
    const offset = (page - 1) * perPage

    if (!params.category_slug && !params.subcategory_slug) {
      return left(
        new ValidationError(
          'Either category_slug or subcategory_slug must be provided'
        )
      )
    }

    let categoryData
    let subcategoriesData

    if (params.category_slug) {
      const categoryResult = await db.query.category.findFirst({
        where: eq(category.slug, params.category_slug)
      })

      if (!categoryResult) {
        return left(new NotFoundError('Category not found'))
      }

      const subcategoriesResult = await db.query.subcategory.findMany({
        where: and(eq(subcategory.categoryId, categoryResult.id)),
        columns: {
          categoryId: false,
          isDefault: false
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
      })

      if (!subcategoriesResult || subcategoriesResult.length === 0) {
        return left(
          new NotFoundError('Default Subcategory not found for this Category')
        )
      }

      categoryData = categoryResult
      subcategoriesData = subcategoriesResult
    } else {
      const subcategoriesResult = await db.query.subcategory.findMany({
        where: eq(subcategory.slug, params.subcategory_slug!),
        columns: {
          isDefault: false
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
      })

      if (!subcategoriesResult || subcategoriesResult.length === 0) {
        return left(new NotFoundError('Subcategory not found'))
      }

      const categoryResult = await db.query.category.findFirst({
        where: eq(category.id, subcategoriesResult[0].categoryId)
      })

      if (!categoryResult) {
        return left(
          new NotFoundError('Category not found for this Subcategory')
        )
      }

      categoryData = categoryResult
      subcategoriesData = subcategoriesResult
    }

    const totalQuery = await db
      .select({ count: count() })
      .from(post)
      .where(
        and(
          inArray(
            post.subcategoryId,
            subcategoriesData.map((subcat) => subcat.id)
          ),
          eq(post.status, 'published')
        )
      )

    const total = totalQuery[0].count
    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    // const posts = await db
    //   .select()
    //   .from(post)
    //   .where(
    //     and(
    //       eq(post.subcategoryId, subcategoryData.id),
    //       eq(post.status, 'published')
    //     )
    //   )
    //   .limit(perPage)
    //   .offset(offset)

    const posts = await db.query.post.findMany({
      where: and(
        inArray(
          post.subcategoryId,
          subcategoriesData.map((subcat) => subcat.id)
        ),
        eq(post.status, 'published')
      ),
      limit: perPage,
      offset: offset,
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

    const { id: categoryId, ...publicCategoryData } = categoryData
    const publicSubcategoriesData = subcategoriesData.map((subcat) => ({
      name: subcat.name,
      slug: subcat.slug,
      description: subcat.description,
      createdAt: subcat.createdAt,
      updatedAt: subcat.updatedAt,
      category: {
        name: subcat.category.name,
        slug: subcat.category.slug,
        description: subcat.category.description
      }
    }))

    return right({
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      },
      category: publicCategoryData,
      subcategories: publicSubcategoriesData,
      data: posts
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listPostsByCategoryOrSubcategory'))
  }
}
