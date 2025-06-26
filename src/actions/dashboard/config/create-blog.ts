'use server'

import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface CreateBlogProps {
  name: string
  description?: string
  logo?: string
}

export async function createBlog(body: CreateBlogProps) {
  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/setup/blog`, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  if (res.status !== 201) return failure(res)

  return success(res)
}
