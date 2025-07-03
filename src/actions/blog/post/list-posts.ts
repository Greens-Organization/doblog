'use server'
import { makeRequestQuery } from '@/actions/request'
import { failure, success } from '@/actions/response'
import type { WithPagination } from '@/actions/types'
import { env } from '@/env'

export async function listPosts(
  params: Partial<{ category_slug: string; subcategory_slug: string }>
) {
  const query = makeRequestQuery(params)

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/blog/post${query}`, {
    next: { revalidate: 5 * 60, tags: ['list-posts'] }
  })

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
