import type { ICategoryDTO } from '@/core/blog/category/dto'
import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { category, subcategory } from '@/infra/db/schemas/blog'
import { auth } from '@/infra/lib/better-auth/auth'
import type { zod } from '@/infra/lib/zod'
import { createCategorySchema } from '@/infra/validations/schemas/category'
import { eq } from 'drizzle-orm'

export async function createCategory(
  request: Request
): Promise<AppEither<ICategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          category: ['create']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const bodyData = await request.json()

    const parsed = createCategorySchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const existCategory = await db.query.category.findFirst({
      where: eq(category.slug, parsed.data.slug)
    })

    if (existCategory) {
      return left(new ConflictError('Category already exists'))
    }

    const data = await db.transaction(async (tx) => {
      const [categoryData] = await tx
        .insert(category)
        .values({
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description
        })
        .returning()

      // Default Subcategory
      const [defaultSubCategory] = await tx
        .insert(subcategory)
        .values({
          categoryId: data.id,
          name: `${parsed.data.name} Default Subcategory`,
          slug: `${parsed.data.slug}-default`,
          isDefault: true
        })
        .returning()

      return categoryData
    })

    return right({ body: data, statusCode: 201 })
  } catch (error) {
    return left(serviceHandleError(error, 'createCategory'))
  }
}
