'use server'

import { cookies } from 'next/headers'

export async function getSession() {
  const ck = await cookies()

  const name = 'better-auth.session_token'

  const token = ck.get(name)?.value

  return { name, value: token, header: `${name}=${token}` }
}
