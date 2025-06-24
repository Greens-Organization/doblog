'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { IUpdateSubcategoryDTO } from '@/core/blog/subcategory/dto'
import { env } from '@/env'

export async function updateSubCategory(
  id: string,
  params: Omit<IUpdateSubcategoryDTO, 'id'>
) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/subcategory/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(params),
      headers: { Cookie: header }
    }
  )

  if (res.status !== 200) return failure(res)
  return success<{
    id: string
    name: string
    slug: string
    description: string
    createdAt: string
    updatedAt: string
  }>(res)
}
