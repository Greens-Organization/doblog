import { constants } from '@test/e2e/helpers/constants'
import { signInAsAdmin } from '@test/e2e/helpers/sign-in-admin'
import { describe, expect, it } from 'bun:test'

const baseUrl = `${constants.SERVER}${constants.PREFIX}/blog/category`

const mockData = {
  name: 'E2E Category',
  slug: 'e2e-category',
  description: 'E2E test category'
}

describe('Category - Create', () => {
  it('should create a new category successfully', async () => {
    const cookie = await signInAsAdmin()

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {})
      },
      body: JSON.stringify(mockData)
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.value.name).toBe(mockData.name)
    expect(json.value.slug).toBe(mockData.slug)
    expect(json.value.description).toBe(mockData.description)
  })

  it('should not allow duplicate category slug', async () => {
    const cookie = await signInAsAdmin()
    const data = {
      name: 'Duplicate Category',
      slug: `duplicate-category-${Math.random().toString(36).slice(2, 8)}`,
      description: 'Duplicate test'
    }
    // First creation
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {})
      },
      body: JSON.stringify(data)
    })
    // Second creation with same slug
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {})
      },
      body: JSON.stringify(data)
    })
    console.log('response.status)', response)
    expect(response.status).toBe(409)
    const json = await response.json()
    expect(json.error.message).toMatch(/already exists/i)
  })
})
