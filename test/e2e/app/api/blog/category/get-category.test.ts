import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

describe('Category - Get Category', () => {
  it('e2e: GET /api/v1/dashboard/category/:id deve retornar a categoria', async () => {
    const categoryId = 'uuid-válido-existente'
    const response = await fetch(
      `${constants.SERVER}/api/v1/dashboard/category/${categoryId}`
    )
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.id).toBe(categoryId)
  })

  it('e2e: GET /api/v1/dashboard/category/:id inválido deve retornar 400', async () => {
    const response = await fetch(
      `${constants.SERVER}/api/v1/dashboard/category/invalid-uuid`
    )
    expect(response.status).toBe(400)
  })
})
