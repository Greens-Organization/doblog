'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

export async function listPosts(categorySlug: string) {
  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/blog/post?category_slug=${categorySlug}`,
    { headers: { Cookie: header } }
  )

  if (res.status !== 200) return failure(res)
  return success<ListsPostSchema>(res)
}

interface Category {
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface Subcategory {
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  category: {
    name: string
    slug: string
    description: string
  }
}

interface Author {
  name: string
  image: string | null
}

interface Post {
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

interface Pagination {
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

interface ListsPostSchema {
  category: Category
  subcategory: Subcategory
  posts: Post[]
  pagination: Pagination
}
