'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

export async function deleteSubCategory(id: string) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/subcategory/${id}`,
    {
      method: 'DELETE',
      headers: { Cookie: header }
    }
  )

  if (res.status !== 200) return failure(res)
  return success<{
    message: string
    deleted: {
      name: string
      createdAt: string
      updatedAt: string
      id: string
      slug: string
      description: string | null
    }
  }>(res)
}
