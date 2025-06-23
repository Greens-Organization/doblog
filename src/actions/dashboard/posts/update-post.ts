'use server'

import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface UpdatePostSuccess {
  id: string
}

interface UpdatePostProps {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category_slug: string
  subcategory_slug?: string
}

function makeUpdatePostBody(body: UpdatePostProps) {
  return {
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    category_slug: body.category_slug,
    subcategory_slug: body.subcategory_slug
  }
}

export async function updatePost(props: UpdatePostProps) {
  const body = makeUpdatePostBody(props)

  const { header } = await getSession()

  const res = await fetch(
    `${env.BETTER_AUTH_URL}/api/v1/dashboard/post/${props.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { Cookie: header }
    }
  )

  if (res.status !== 200) return failure(res)

  return success<UpdatePostSuccess>(res)
}
