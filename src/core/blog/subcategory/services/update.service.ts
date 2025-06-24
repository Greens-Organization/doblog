import type { AppEither } from '@/core/error/app-either.protocols'
import { left, right } from '@/core/error/either'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '@/core/error/errors'
import { serviceHandleError } from '@/core/error/handlers'
import { db } from '@/infra/db'
import { subcategory } from '@/infra/db/schemas/blog'
import { extractAndValidatePathParams } from '@/infra/helpers/params'
import { auth } from '@/infra/lib/better-auth/auth'
import { zod } from '@/infra/lib/zod'
import { updateCategorySchema } from '@/infra/validations/schemas/category'
import { and, eq, ne } from 'drizzle-orm'
import type { ISubcategoryDTO } from '../dto'

const pathParamSchema = zod.object({
  id: zod.uuid('Invalid category ID')
})

export async function updateSubcategory(
  request: Request
): Promise<AppEither<ISubcategoryDTO>> {
  try {
    const canAccess = await auth.api.hasPermission({
      headers: request.headers,
      body: {
        permissions: {
          subcategory: ['update']
        }
      }
    })

    if (!canAccess.success) {
      return left(
        new UnauthorizedError('You do not have permission to do this')
      )
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

    const existingSubcategory = await db.query.subcategory.findFirst({
      where: eq(subcategory.id, id),
      columns: {
        categoryId: false
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

    if (!existingSubcategory) {
      return left(new NotFoundError('Subcategory not found'))
    }

    if (existingSubcategory.isDefault) {
      return left(new ConflictError('Cannot update a default subcategory'))
    }

    const bodyData = await request.json()

    const parsedBody = updateCategorySchema().safeParse(bodyData)
    if (!parsedBody.success) {
      return left(
        new ValidationError(
          parsedBody.error.issues
            .map((e: { message: string }) => e.message)
            .join('; ')
        )
      )
    }

    if (parsedBody.data.slug !== existingSubcategory.slug) {
      const slugAlreadyUsed = await db.query.subcategory.findFirst({
        where: and(
          ne(subcategory.id, id),
          eq(subcategory.slug, parsedBody.data.slug!)
        )
      })

      if (slugAlreadyUsed) {
        return left(
          new ConflictError('Slug already in use by another subcategory')
        )
      }
    }

    const updatedSubcategoryData = {
      name: parsedBody.data.name,
      slug: parsedBody.data.slug,
      description: parsedBody.data.description
    }

    const updatedCategory = await db.transaction(async (tx) => {
      const [data] = await db
        .update(subcategory)
        .set(updatedSubcategoryData)
        .where(eq(subcategory.id, id))
        .returning()

      return data
    })

    return right({
      ...updatedCategory,
      category: existingSubcategory.category
    })
  } catch (error) {
    return left(serviceHandleError(error, 'updateSubcategory'))
  }
}
