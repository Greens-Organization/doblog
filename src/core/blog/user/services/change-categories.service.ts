import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { user, userToCategory } from '@/infra/db/schemas/auth'
import { category } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { updateCategoriesUserHasPermissionSchema } from '@/infra/validations/schemas/user'
import { and, eq, inArray } from 'drizzle-orm'
import type { ICategoryDTO } from '../../category/dto'
import { blogRepository } from '../../repository'
import type { IUserDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid user ID')
})

export async function changeCategoriesOfUser(request: Request): Promise<
  AppEither<
    | (Pick<IUserDTO, 'name' | 'image' | 'email' | 'role'> & {
        categories: Pick<ICategoryDTO, 'id' | 'name' | 'description' | 'slug'>[]
      })
    | null
  >
> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          user: ['changeCategories']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const blogData = await blogRepository.getBlog()
    if (!blogData) {
      return left(new NotFoundError('Blog not found'))
    }

    const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
      'id'
    ])
    if (!parsedParam.success) {
      return left(
        new ValidationError(
          parsedParam.error.issues
            .map((e: { message: string }) => e.message)
            .join('; ')
        )
      )
    }
    const { id } = parsedParam.data

    const userData = await db.query.user.findFirst({
      where: eq(user.id, id)
    })
    if (!userData) {
      return left(new NotFoundError('User not found'))
    }

    const bodyData = await request.json()
    const parsed = updateCategoriesUserHasPermissionSchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const categoryIds = parsed.data.categories

    const validCategories = await db.query.category.findMany({
      where: inArray(category.id, categoryIds),
      columns: { id: true }
    })

    const validCategoryIds = validCategories.map((c) => c.id)
    const notFound = categoryIds.filter((id) => !validCategoryIds.includes(id))
    if (notFound.length > 0) {
      return left(
        new NotFoundError(`Categories not found: ${notFound.join(', ')}`)
      )
    }

    const currentUserCategories = await db.query.userToCategory.findMany({
      where: eq(userToCategory.userId, userData.id),
      columns: { categoryId: true }
    })
    const currentCategoryIds = currentUserCategories.map((c) => c.categoryId)

    const toAdd = validCategoryIds.filter(
      (id) => !currentCategoryIds.includes(id)
    )
    const toRemove = currentCategoryIds.filter(
      (id) => !validCategoryIds.includes(id)
    )

    await db.transaction(async (tx) => {
      if (toRemove.length > 0) {
        await tx
          .delete(userToCategory)
          .where(
            and(
              eq(userToCategory.userId, userData.id),
              inArray(userToCategory.categoryId, toRemove)
            )
          )
      }

      if (toAdd.length > 0) {
        await tx.insert(userToCategory).values(
          toAdd.map((categoryId) => ({
            userId: userData.id,
            categoryId
          }))
        )
      }
    })

    const categories = await db.query.category.findMany({
      where: inArray(category.id, validCategoryIds),
      columns: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    })

    return right({
      body: {
        email: userData.email,
        name: userData.name,
        image: userData.image,
        role: userData.role,
        categories: categories
      },
      statusCode: 200
    })
  } catch (error) {
    return left(serviceHandleError(error, 'updateUser'))
  }
}
