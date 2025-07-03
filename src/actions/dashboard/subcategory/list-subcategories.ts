'use server'

import { getSession } from '@/actions/get-session'
import { makeRequestQuery } from '@/actions/request'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import { env } from '@/env'

interface ListSubcategories extends Record<string, string> {
  name: string
}

export async function listSubcategories(filters: ListSubcategories) {
  const { header } = await getSession()

  const query = makeRequestQuery(filters)

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/subcategory${query}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)
  return success<
    WithPagination<
      Array<{
        name: string
        createdAt: string
        updatedAt: string
        id: string
        slug: string
        description: string | null
        category: {
          name: string
          slug: string
          description: string | null
        }
      }>
    >
  >(res)
}
