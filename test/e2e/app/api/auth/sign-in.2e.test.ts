import { describe, expect, it } from 'bun:test'
import { env } from '@/env'
import { constants } from '@test/e2e/helpers/constants'

describe('Auth - Sign In', () => {
  it('e2e: POST api/auth/sign-in deve retornar sucesso para login', async () => {
    const response = await fetch(`${constants.SERVER}/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD
      })
    })

    expect(response.status).toBe(200)
  })
})
