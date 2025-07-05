'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import { env } from '@/env'

export async function listPosts(params: Partial<{ status: string }>) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/post?${new URLSearchParams(params).toString()}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)
  return success<WithPagination<ListPosts>>(res)
}

interface Author {
  name: string
  image: string | null
}

export interface Post {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  status: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  author: Author
  subcategory: {
    name: string
    slug: string
    description: string | null
    category: {
      name: string
      slug: string
      description: string
    }
  }
}

export type ListPosts = Post[]
