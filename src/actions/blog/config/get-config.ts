'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface Success {
  name: string
  slug: string
  description: string
  logo: string
  keywords: string | null
}

export async function getConfig() {
  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/blog/`, {
    headers: { Cookie: header }
  })

  if (res.status !== 200) return failure(res)
  return success<Success>(res)
}
