import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

describe('Category - List Categories', () => {
  it('e2e: GET /api/v1/dashboard/category deve retornar sucesso', async () => {
    const response = await fetch(
      `${constants.SERVER}/api/v1/dashboard/category`
    )
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it('e2e: GET /api/v1/dashboard/category?slug=unknown deve retornar vazio', async () => {
    const response = await fetch(
      `${constants.SERVER}/api/v1/dashboard/category?slug=unknown`
    )
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.length).toBe(0)
  })
})
