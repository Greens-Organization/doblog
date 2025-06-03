'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { ICreateCategoryDTO } from '@/core/blog/category/dto'
import { env } from '@/env'

export async function createCategory(params: ICreateCategoryDTO) {
  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/dashboard/category`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { Cookie: header }
  })

  if (res.status !== 201) return failure(res)
  return success<{
    id: string
    name: string
    slug: string
    description: string
    createdAt: string
    updatedAt: string
  }>(res)
}
