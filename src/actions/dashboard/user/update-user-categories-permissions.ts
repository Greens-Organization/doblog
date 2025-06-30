'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface UpdateUserParams {
  userId: string
  categories: string[]
}

export async function updateUserCategoriesPermissions(body: UpdateUserParams) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/user/${body.userId}`,
    {
      body: JSON.stringify({ categories: body.categories }),
      headers: { Cookie: header },
      method: 'PATCH'
    }
  )

  if (res.status !== 200) return failure(res)
  return success(res)
}
