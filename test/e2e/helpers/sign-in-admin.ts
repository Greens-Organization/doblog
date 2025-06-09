import users from '@/infra/db/seed/assets/users.json'
import { constants } from './constants'

export async function signInAsAdmin() {
  const response = await fetch(`${constants.SERVER}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: users.admin.email,
      password: users.admin.password
    })
  })
  if (response.status !== 200) throw new Error('Failed to sign in')
  const cookie = response.headers.get('set-cookie')
  return cookie
}
