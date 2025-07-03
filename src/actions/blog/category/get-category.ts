'use server'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

export async function getCategory(slug: string) {
  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/blog/category/${slug}`,
    { next: { revalidate: 10 * 60, tags: ['get-category'] } }
  )

  if (res.status !== 200) return failure(res)
  return success<{
    name: string
    slug: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    subcategory: {
      name: string
      slug: string
      description: string | null
    }[]
  }>(res)
}
