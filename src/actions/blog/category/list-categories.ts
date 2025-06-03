'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

export async function listCategories() {
  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/blog/category`, {
    headers: { Cookie: header }
  })

  if (res.status !== 200) return failure(res)
  return success<
    Array<{
      name: string
      slug: string
      description: string | null
      createdAt: string
      updatedAt: string
      subcategory: Array<{
        name: string
        slug: string
        description: string | null
      }>
    }>
  >(res)
}
