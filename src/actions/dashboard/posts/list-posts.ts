'use server'

import { getSession } from '@/actions/get-session'
import { makeRequestQuery } from '@/actions/request'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import { env } from '@/env'

export async function listPosts(
  params: Partial<{ name: string; status: string }>
) {
  const { header } = await getSession()

  const query = makeRequestQuery(params)

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/post${query}`,
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
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  status: 'published' | 'draft' | 'archived'
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
