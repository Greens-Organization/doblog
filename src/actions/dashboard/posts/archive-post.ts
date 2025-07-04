'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

export async function archivePost(id: string) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/post/${id}`,
    {
      method: 'DELETE',
      headers: { Cookie: header }
    }
  )

  if (res.status !== 200) return failure(res)

  return success(res)
}