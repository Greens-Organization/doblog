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
import { createSubcategorySchema } from '@/infra/validations/schemas/subcategory'
import { eq } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'

export async function createSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          subcategory: ['create']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
    }

    const bodyData = await request.json()

    const parsed = createSubcategorySchema().safeParse(bodyData)
    if (!parsed.success) {
      return left(
        new ValidationError(
          (parsed.error as zod.ZodError).issues.map((e) => e.message).join('; ')
        )
      )
    }

    const categoryData = await db.query.category.findFirst({
      where: eq(category.id, parsed.data.category_slug)
    })

    if (!categoryData) {
      return left(new ValidationError('Category not found'))
    }

    const existSubcategory = await db.query.subcategory.findFirst({
      where: eq(subcategory.slug, parsed.data.slug)
    })

    if (existSubcategory) {
      return left(new ConflictError('Subcategory already exists'))
    }

    const subcategoryData = await db.transaction(async (tx) => {
      const [{ categoryId, ...data }] = await tx
        .insert(subcategory)
        .values({
          categoryId: categoryData.id,
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description
        })
        .returning()

      return data
    })

    const { createdAt, updatedAt, ...categoryDataFiltered } = categoryData

    return right({
      body: { ...subcategoryData, category: categoryDataFiltered },
      statusCode: 201
    })
  } catch (error) {
    return left(serviceHandleError(error, 'createSubcategory'))
  }
}
