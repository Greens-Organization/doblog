import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { ISubcategoryDTO } from '@/core/blog/subcategory/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import { NotFoundError, UnauthorizedError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { userToCategory } from '@/infra/db/schemas/auth'
import {
  PostStatus,
  category,
  post,
  subcategory
} from '@/infra/db/schemas/blog'
import { ensureAuthenticated } from '@/infra/helpers/auth'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import type { IGetPostDTO } from '../dto'

const searchParamsSchema = zod.object({
  category_slug: zod.string().optional(),
  subcategory_slug: zod.string().optional(),
  status: zod
    .union([zod.string(), zod.enum([...PostStatus, 'all']).optional()])
    .default('all'),
  page: zod.coerce.number().min(1).optional().default(1),
  per_page: zod.coerce.number().min(1).optional().default(25)
})

interface ResponseDTO {
  category: ICategoryDTO | null
  subcategory: ISubcategoryDTO | null
  data: IGetPostDTO[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export async function listPosts(
  request: Request
): Promise<AppEither<ResponseDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          post: ['list']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }
    const session = await ensureAuthenticated(request)
    if (isLeft(session)) {
      return left(session.value)
    }
    if (!session.value || !session.value.user) {
      return left(new UnauthorizedError('User not found in session'))
    }

    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      category_slug: url.searchParams.get('category_slug') ?? undefined,
      subcategory_slug: url.searchParams.get('subcategory_slug') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      per_page: url.searchParams.get('per_page') ?? undefined,
      status: url.searchParams.get('status') ?? undefined
    })

    const page = params.page ?? 1
    const perPage = params.per_page ?? 25
    const offset = (page - 1) * perPage

    // Check if the user has categories
    const userCategoriesPermission = await db.query.userToCategory.findMany({
      where: eq(userToCategory.userId, session.value.user.id)
    })
    if (!userCategoriesPermission) {
      return left(
        new UnauthorizedError('You do not have permission to access categories')
      )
    }
    const categoryIds = userCategoriesPermission.map(
      (userCategory) => userCategory.categoryId
    )
    const userCategories = await db.query.category.findMany({
      where: inArray(category.id, categoryIds),
      with: {
        subcategory: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isDefault: true
          }
        }
      }
    })
    const userSubcategories = userCategories.flatMap((c) => c.subcategory)
    if (params.category_slug) {
      const allowedCategory = userCategories.find(
        (cat) => cat.slug === params.category_slug
      )
      if (!allowedCategory) {
        return right({
          pagination: {
            total: 0,
            page,
            per_page: perPage,
            total_pages: 0,
            has_next: false,
            has_previous: false
          },
          category: null,
          subcategory: null,
          data: []
        })
      }
    }

    if (params.subcategory_slug) {
      const allowedSubcategory = userSubcategories.find(
        (sub) => sub.slug === params.subcategory_slug
      )
      if (!allowedSubcategory) {
        return right({
          pagination: {
            total: 0,
            page,
            per_page: perPage,
            total_pages: 0,
            has_next: false,
            has_previous: false
          },
          category: null,
          subcategory: null,
          data: []
        })
      }
    }

    // Filter per category or subcategory
    let categoryData: ICategoryDTO | null = null
    let subcategoryData: ISubcategoryDTO | null = null
    const whereList: any[] = []

    if (params.category_slug) {
      // 1. Category filter
      const categoryResult = await db.query.category.findFirst({
        where: eq(category.slug, params.category_slug)
      })
      if (!categoryResult) {
        return left(new NotFoundError('Category not found'))
      }
      categoryData = categoryResult

      const subcategoryResult = await db.query.subcategory.findFirst({
        where: and(
          eq(subcategory.categoryId, categoryResult.id),
          eq(subcategory.isDefault, true)
        ),
        columns: {
          categoryId: false,
          isDefault: false
        },
        with: {
          category: {
            columns: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          }
        }
      })
      if (!subcategoryResult) {
        return left(
          new NotFoundError('Default Subcategory not found for this Category')
        )
      }
      subcategoryData = subcategoryResult

      whereList.push(eq(post.subcategoryId, subcategoryResult.id))
    }

    if (params.subcategory_slug) {
      // 2. Subcategory filter
      const subcategoryResult = await db.query.subcategory.findFirst({
        where: eq(subcategory.slug, params.subcategory_slug),
        columns: {
          isDefault: false
        },
        with: {
          category: {
            columns: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          }
        }
      })
      if (!subcategoryResult) {
        return left(new NotFoundError('Subcategory not found'))
      }
      subcategoryData = subcategoryResult

      const categoryResult = await db.query.category.findFirst({
        where: eq(category.id, subcategoryResult.categoryId)
      })
      if (!categoryResult) {
        return left(
          new NotFoundError('Category not found for this Subcategory')
        )
      }
      categoryData = categoryResult

      whereList.push(eq(post.subcategoryId, subcategoryResult.id))
    }

    if (!params.category_slug && !params.subcategory_slug) {
      // 3. If no category or subcategory is specified, filter by user categories
      const allowedSubcategoryIds = userSubcategories.map((sub) => sub.id)
      whereList.push(inArray(post.subcategoryId, allowedSubcategoryIds))
    }

    if (params.status && params.status !== 'all') {
      // 4. Status filter
      whereList.push(
        eq(post.status, params.status as (typeof PostStatus)[number])
      )
    }

    const whereClause = and(...whereList)

    // Count total posts for pagination
    const totalQuery = await db
      .select({ count: count() })
      .from(post)
      .where(whereClause)

    const total = totalQuery[0].count
    const totalPages = Math.ceil(total / perPage)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    // Fetch posts with pagination
    const posts = await db.query.post.findMany({
      where: whereClause,
      orderBy: [desc(post.createdAt)],
      limit: perPage,
      offset: offset,
      with: {
        author: {
          columns: {
            id: true,
            role: true,

            name: true,
            image: true
          }
        },
        subcategory: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true
          },
          with: {
            category: {
              columns: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            }
          }
        }
      }
    })

    return right({
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrevious
      },
      data: posts,
      category: categoryData,
      subcategory: subcategoryData
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listPostsByCategoryOrSubcategory'))
  }
}
