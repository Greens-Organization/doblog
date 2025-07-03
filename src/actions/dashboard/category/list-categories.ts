'use server'

import { getSession } from '@/actions/get-session'
import { makeRequestQuery } from '@/actions/request'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import { env } from '@/env'

interface ListCategories extends Partial<Record<string, string>> {
  name?: string
  slug?: string
}

export async function listCategories(filters?: ListCategories) {
  const { header } = await getSession()

  const query = makeRequestQuery(filters)

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/category${query}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)
  return success<
    WithPagination<
      Array<{
        id: string
        name: string
        slug: string
        description: string | null
        createdAt: string
        updatedAt: string
        totalPost: number
        subcategory: Array<{
          name: string
          slug: string
          description: string | null
        }>
      }>
    >
  >(res)
}
