import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

const baseUrl = `${constants.SERVER}/api/v1/dashboard/category`

describe('Category - Create Category', () => {
  it('e2e: POST /api/v1/dashboard/category deve criar uma categoria', async () => {
    const payload = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'A category created for testing purposes'
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('id')
    expect(data.name).toBe(payload.name)
    expect(data.slug).toBe(payload.slug)

    // Cleanup
    await fetch(`${baseUrl}/${data.id}`, { method: 'DELETE' })
  })

  it('e2e: POST /api/v1/dashboard/category com slug duplicado deve falhar', async () => {
    const payload = {
      name: 'Category Dup',
      slug: 'category-dup',
      description: 'Duplicate test'
    }

    const created = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((res) => res.json())

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toMatch(/already exists/i)

    await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
  })

  it('e2e: POST /api/v1/dashboard/category com dados inválidos deve falhar', async () => {
    const payload = {
      name: '', // inválido
      slug: '', // inválido
      description: 'Missing required fields'
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('e2e: POST /api/v1/dashboard/category com slug inválido deve falhar', async () => {
    const payload = {
      name: 'Invalid Slug',
      slug: 'invalid slug with spaces',
      description: 'Invalid slug'
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })
})
