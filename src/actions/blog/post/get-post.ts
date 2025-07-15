'use server'

'use server'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface GetPostSuccess {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  updatedAt: string
  createdAt: string
  featuredImage: string | null
  status: 'published' | 'draft' | 'archived'
  author: {
    image: string | null
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

export async function getPost(slug: string) {
  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/blog/post/${slug}`)

  if (res.status !== 200) return failure(res)

  return success<GetPostSuccess>(res)
}
