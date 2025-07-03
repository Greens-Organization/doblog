'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface CreateSubCategory {
  name: string
  slug: string
  description: string
  category_slug: string
}

export async function createSubCategory(params: CreateSubCategory) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/subcategory`,
    {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { Cookie: header }
    }
  )

  if (res.status !== 201) return failure(res)
  return success<{
    name: string
    createdAt: string
    updatedAt: string
    id: string
    slug: string
    description: string | null
  }>(res)
}
