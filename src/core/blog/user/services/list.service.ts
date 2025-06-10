import type { IUserDTO } from '@/core/blog/user/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import { UnauthorizedError } from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import {
  buildCountQuery,
  buildUserListQuery,
  UserQueryBuilder
} from '../helpers'

// Schema for validating search parameters
const searchParamsSchema = zod.object({
  category_id: zod.uuid().optional(),
  name: zod.string().min(1).optional(),
  email: zod.email().optional(),
  page: zod.coerce.number().min(1).optional().default(1),
  per_page: zod.coerce.number().min(1).max(100).optional().default(25)
})

type SearchParams = zod.infer<typeof searchParamsSchema>

interface ResponseDTO {
  data: IUserDTO[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Function to validate permissions
async function validatePermissions(request: Request): Promise<boolean> {
  const canAccess = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      permissions: {
        user: ['list']
      }
    }
  })

  return canAccess.success
}

// Function to extract and validate URL parameters
function extractSearchParams(url: URL): SearchParams {
  return searchParamsSchema.parse({
    category_id: url.searchParams.get('category_id') ?? undefined,
    name: url.searchParams.get('name') ?? undefined,
    email: url.searchParams.get('email') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    per_page: url.searchParams.get('per_page') ?? undefined
  })
}

// Function to calculate pagination information
function calculatePagination(total: number, page: number, perPage: number) {
  const totalPages = Math.ceil(total / perPage)
  const hasNext = page < totalPages
  const hasPrevious = page > 1

  return {
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
    has_next: hasNext,
    has_previous: hasPrevious
  }
}

export async function listUser(
  request: Request
): Promise<AppEither<ResponseDTO>> {
  try {
    // Permission validation
    const hasPermission = await validatePermissions(request)
    if (!hasPermission) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    // Parameter extraction and validation
    const url = new URL(request.url)
    const params = extractSearchParams(url)

    // Pagination calculation
    const page = params.page
    const perPage = params.per_page
    const offset = (page - 1) * perPage

    // Building filter conditions
    const queryBuilder = new UserQueryBuilder()

    if (params.category_id) {
      queryBuilder.addCategoryFilter(params.category_id)
    }

    if (params.name) {
      queryBuilder.addNameFilter(params.name)
    }

    if (params.email) {
      queryBuilder.addEmailFilter(params.email)
    }

    const { whereClause } = queryBuilder.build()

    // Total record count
    const countQuery = buildCountQuery(whereClause)
    const totalResult = await db.execute(countQuery)
    const total = totalResult.rows[0].total as number

    // Main query with pagination
    const query = buildUserListQuery(whereClause, perPage, offset)
    const result = await db.execute(query)
    const users = result.rows as unknown as IUserDTO[]

    // Pagination information calculation
    const pagination = calculatePagination(total, page, perPage)

    return right({
      data: users,
      pagination
    })
  } catch (error) {
    return left(serviceHandleError(error, 'listUser'))
  }
}
