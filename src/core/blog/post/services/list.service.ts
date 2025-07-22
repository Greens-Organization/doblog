import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { ISubcategoryDTO } from '@/core/blog/subcategory/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { isLeft, left, right } from '@/core/error/either'
import { NotFoundError, UnauthorizedError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import {
  PostStatus,
  category,
  post,
  subcategory
} from '@/infra/db/schemas/blog'
import { checkIsAdmin, ensureAuthenticated } from '@/infra/helpers/auth'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { and, count, desc, eq, inArray, like } from 'drizzle-orm'
import { checkUserCategories } from '../../user/services'
import type { IGetPostDTO } from '../dto'
import { sanitizeValue } from '@/infra/helpers/sanitize'

const searchParamsSchema = zod.object({
  title: zod.string().min(1).optional(),
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
    const sessionResult = await ensureAuthenticated(request)
    if (isLeft(sessionResult)) return left(sessionResult.value)
    const session = sessionResult.value
    const isAdmin = checkIsAdmin(session)

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

    const url = new URL(request.url)
    const params = searchParamsSchema.parse({
      title: url.searchParams.get('title') ?? undefined,
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
    const checkUser = await checkUserCategories({
      userId: session!.user.id
    })
    if (isLeft(checkUser)) {
      return left(checkUser.value)
    }
    const { categories: userCategories, subcategories: userSubcategories } =
      checkUser.value
    const allowedSubcategoryIds = userSubcategories.map((sub) => sub.id)

    // Validate category and subcategory slugs exist in user categories
    if (params.category_slug) {
      const allowedCategory = userCategories.find(
        (cat) => cat.slug === params.category_slug
      )
      if (!allowedCategory && !isAdmin) {
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
      if (!allowedSubcategory && !isAdmin) {
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

    if (!params.category_slug && !params.subcategory_slug && !isAdmin) {
      // 3. If no category or subcategory is specified, filter by user categories
      whereList.push(inArray(post.subcategoryId, allowedSubcategoryIds))
    }

    if (params.status && params.status !== 'all') {
      // 4. Status filter
      whereList.push(
        eq(post.status, params.status as (typeof PostStatus)[number])
      )
    }

    if (params.title) {
      // 5. Title filter - busca case-insensitive
      whereList.push(like(post.title, `%${sanitizeValue(params.title)}%`))
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

    console.log('Posts fetched:', posts)

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
