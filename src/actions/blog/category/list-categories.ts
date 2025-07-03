import { makeRequestQuery } from '@/actions/request'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

type Success = Array<{
  name: string
  createdAt: Date
  updatedAt: Date
  description: string | null
  slug: string
  subcategory: {
    name: string
    description: string | null
    slug: string
  }[]
}>

interface ListCategories extends Partial<Record<string, string>> {
  name?: string
  slug?: string
}

export async function listCategories(filters?: ListCategories) {
  const query = makeRequestQuery(filters)

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/blog/category${query}`)

  if (res.status !== 200) return failure(res)
  return success<Success>(res)
}
