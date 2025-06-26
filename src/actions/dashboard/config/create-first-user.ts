'use server'

import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface CreateFirstUser {
  name: string
  email: string
  password: string
}

export async function createFirstUser(body: CreateFirstUser) {
  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/setup/user`, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  if (res.status !== 201) return failure(res)

  return success(res)
}
