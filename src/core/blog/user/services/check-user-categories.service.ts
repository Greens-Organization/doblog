import { type Either, left, right } from '@/core/error/either'
import { type BaseError, UnauthorizedError } from '@/core/error/errors'
import { db } from '@/infra/db'
import { userToCategory } from '@/infra/db/schemas/auth'
import { category } from '@/infra/db/schemas/blog'
import { eq, inArray } from 'drizzle-orm'
import type { ICategoryDTO } from '../../category/dto'
import type { ISubcategoryDTO } from '../../subcategory/dto'

interface CheckUserCategoriesDTO {
  userId: string
}

type CheckUserCategoriesResponse = Promise<
  Either<
    BaseError,
    { categories: ICategoryDTO[]; subcategories: ISubcategoryDTO[] }
  >
>

export async function checkUserCategories({
  userId
}: CheckUserCategoriesDTO): CheckUserCategoriesResponse {
  const userCategoriesPermission = await db.query.userToCategory.findMany({
    where: eq(userToCategory.userId, userId)
  })
  if (!userCategoriesPermission) {
    return left(
      new UnauthorizedError('Problem fetching user categories permissions')
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
          isDefault: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  })
  const userSubcategories: ISubcategoryDTO[] = userCategories.flatMap(
    (categoryItem) =>
      categoryItem.subcategory.map((subcat) => ({
        ...subcat,
        category: {
          name: categoryItem.name,
          slug: categoryItem.slug,
          description: categoryItem.description
        }
      }))
  )

  return right({
    categories: userCategories as ICategoryDTO[],
    subcategories: userSubcategories
  })
}
