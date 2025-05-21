import { constants } from '@test/e2e/helpers/constants'
import { describe, expect, it } from 'bun:test'

const baseUrl = `${constants.SERVER}/api/v1/dashboard/category`

describe('Category - Delete Category', () => {
  it('e2e: DELETE /api/v1/dashboard/category/:id deve excluir a categoria', async () => {
    // Cria categoria temporária
    const created = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'To be deleted',
        slug: 'to-be-deleted',
        description: 'Temporary category'
      })
    }).then((res) => res.json())

    const response = await fetch(`${baseUrl}/${created.id}`, {
      method: 'DELETE'
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.message).toMatch(/successfully deleted/i)
    expect(data.deleted.id).toBe(created.id)
  })

  it('e2e: DELETE /api/v1/dashboard/category/:id inexistente deve retornar 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const response = await fetch(`${baseUrl}/${fakeId}`, {
      method: 'DELETE'
    })

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toMatch(/not found/i)
  })
})
