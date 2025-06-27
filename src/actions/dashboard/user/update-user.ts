'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { UserRole } from '@/core/blog/user/dto'
import { env } from '@/env'

interface UpdateUserParams {
  id: string
  name?: string
  email?: string
  role?: UserRole
}

export async function updateUser(body: UpdateUserParams) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/user/${body.id}`,
    {
      body: JSON.stringify(body),
      headers: { Cookie: header },
      method: 'PUT'
    }
  )

  if (res.status !== 200) return failure(res)
  return success(res)
}
