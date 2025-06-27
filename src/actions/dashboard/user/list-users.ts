'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import type { IUserDTO } from '@/core/blog/user/dto'
import { env } from '@/env'

type SuccessResponse = WithPagination<IUserDTO[]>

export async function listUsers() {
  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/dashboard/user`, {
    headers: { Cookie: header }
  })

  if (res.status !== 200) return failure(res)
  return success<SuccessResponse>(res)
}
