import { env } from '@/env'
import { describe, expect, it } from 'bun:test'

const server = 'http://localhost:3000'

describe('Auth - Sign In', () => {
  it('e2e: POST api/auth/sign-in deve retornar sucesso para login', async () => {
    const response = await fetch(`${server}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      })
    })
    // const response = await auth.api.signInEmail({
    //   body: {
    //     email: env.ADMIN_EMAIL,
    //     password: env.ADMIN_PASSWORD
    //   }
    // })

    expect(response.status).toBe(200) // BAD REQUEST
    const data = (await response.json()) as any

    // expect(data.error).toBeDefined()
    // expect(data.error.data.httpStatus).toBe(400)
    // expect(data.error.message).toContain('invalid_string')
  })
})
