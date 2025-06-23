'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface CreatePostSuccess {
  id: string
}

interface CreatePostProps {
  title: string
  slug: string
  excerpt: string
  content: string
  category_slug: string
  subcategory_slug?: string
}

function makeCreatePostBody(body: CreatePostProps) {
  return {
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    category_slug: body.category_slug,
    subcategory_slug: body.subcategory_slug
  }
}

export async function createPost(props: CreatePostProps) {
  const body = makeCreatePostBody(props)

  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/v1/dashboard/post`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Cookie: header }
  })

  if (res.status !== 201) return failure(res)

  return success<CreatePostSuccess>(res)
}
