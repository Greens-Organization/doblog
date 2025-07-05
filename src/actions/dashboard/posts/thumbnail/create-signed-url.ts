'use server'
import { getSession } from '@/actions/get-session'
import { failure, success } from '@/actions/response'
import { env } from '@/env'

interface CreateSignedURL {
  fileType: string
  fileName: string
}

export async function createSignedURL({ fileType, fileName }: CreateSignedURL) {
  const { header } = await getSession()

  const res = await fetch(`${env.BETTER_AUTH_URL}/api/upload/thumbnail`, {
    method: 'POST',
    body: JSON.stringify({ type: fileType, name: fileName }),
    headers: { Cookie: header }
  })

  if (!res.ok) {
    return failure(res)
  }

  return success<{ url: string; public_url: string }>(res)
}
