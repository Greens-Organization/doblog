import users from '@/infra/db/seed/assets/users.json'
import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

describe('Auth - Sign In', () => {
  it('e2e: POST api/auth/sign-in deve retornar sucesso para login', async () => {
    const response = await fetch(`${constants.SERVER}/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: users.admin.email,
        password: users.admin.password
      })
    })

    expect(response.status).toBe(200)
  })
})
