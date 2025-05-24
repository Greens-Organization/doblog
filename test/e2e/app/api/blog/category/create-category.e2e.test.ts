import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog'
import { constants } from '@test/e2e/helpers/constants'
import { signInAsAdmin } from '@test/e2e/helpers/sign-in-admin'
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'

const baseUrl = `${constants.SERVER}${constants.PREFIX}/blog/category`

const mockData = {
  name: 'E2E Category',
  slug: 'e2e-category',
  description: 'E2E test category'
}

describe('Category - Create', () => {
  beforeAll(async () => {
    await db.delete(category).where(eq(category.slug, mockData.slug))
  })

  afterAll(async () => {
    await db.delete(category).where(eq(category.slug, mockData.slug))
  })
  it('e2e: should create a new category successfully', async () => {
    const cookie = await signInAsAdmin()

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie ? cookie : ''
      },
      body: JSON.stringify(mockData)
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.name).toBe(mockData.name)
    expect(json.slug).toBe(mockData.slug)
    expect(json.description).toBe(mockData.description)
  })

  it('e2e: should not allow duplicate category slug', async () => {
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
    expect(response.status).toBe(409)
    const json = await response.json()

    expect(json.error).toMatch(/already exists/i)
  })
})
