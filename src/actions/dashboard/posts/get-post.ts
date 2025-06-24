'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface GetPostSuccess {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  status: 'published' | 'draft'
  author: {
    role: 'editor' | 'admin'
    name: string
  }
  subcategory: {
    name: string
    slug: string
    description: string
    category: {
      name: string
      slug: string
    }
  }
}

export async function getPost(id: string) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/post/${id}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)

  return success<GetPostSuccess>(res)
}
