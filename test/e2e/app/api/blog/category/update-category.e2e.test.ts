import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

const baseUrl = `${constants.SERVER}/api/v1/dashboard/category`

describe('Category - Update Category', () => {
  it('e2e: PUT /api/v1/dashboard/category/:id deve atualizar uma categoria', async () => {
    const created = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Old Name',
        slug: 'old-slug',
        description: 'Old description'
      })
    }).then((res) => res.json())

    const payload = {
      name: 'New Name',
      slug: 'new-slug',
      description: 'Updated description'
    }

    const response = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.name).toBe(payload.name)
    expect(data.slug).toBe(payload.slug)

    await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
  })

  it('e2e: PUT /api/v1/dashboard/category/:id com slug duplicado deve falhar', async () => {
    const cat1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cat One',
        slug: 'cat-one',
        description: 'First category'
      })
    }).then((res) => res.json())

    const cat2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cat Two',
        slug: 'cat-two',
        description: 'Second category'
      })
    }).then((res) => res.json())

    const payload = {
      name: 'Trying Duplicate Slug',
      slug: 'cat-one', // já usado
      description: 'Duplicate slug'
    }

    const response = await fetch(`${baseUrl}/${cat2.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toMatch(/slug.*in use/i)

    await fetch(`${baseUrl}/${cat1.id}`, { method: 'DELETE' })
    await fetch(`${baseUrl}/${cat2.id}`, { method: 'DELETE' })
  })

  it('e2e: PUT /api/v1/dashboard/category/:id com dados inválidos deve falhar', async () => {
    const created = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Temp Category',
        slug: 'temp-category',
        description: 'Temporary'
      })
    }).then((res) => res.json())

    const payload = {
      name: '', // inválido
      slug: '', // inválido
      description: 'Invalid data'
    }

    const response = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data).toHaveProperty('error')

    await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
  })

  it('e2e: PUT /api/v1/dashboard/category/:id inexistente deve retornar 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const payload = {
      name: 'Nonexistent',
      slug: 'nonexistent',
      description: 'Trying to update non-existing'
    }

    const response = await fetch(`${baseUrl}/${fakeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toMatch(/not found/i)
  })
})
