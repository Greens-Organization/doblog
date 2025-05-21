import { env } from '@/env'
import { constants } from './constants'

export async function signInAsAdmin() {
  const response = await fetch(`${constants.SERVER}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD
    })
  })
  if (response.status !== 200) throw new Error('Failed to sign in')
  const cookie = response.headers.get('set-cookie')
  return cookie
}
