'use server'

'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { IUserDTO } from '@/core/blog/user/dto'
import { env } from '@/env'

export async function getUser(id: string) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/user/${id}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)
  return success<IUserDTO>(res)
}
