import { constants } from '@test/e2e/helpers/constants'
import { signInAsAdmin } from '@test/e2e/helpers/sign-in-admin'
import { describe, expect, it } from 'bun:test'
import { createCategory } from './helper/create-category'

const baseUrl = `${constants.SERVER}${constants.PREFIX}/blog/category`

describe('Category - Delete', () => {
  it('should delete a category successfully', async () => {
    const cookie = await signInAsAdmin()
    const { json } = await createCategory(cookie)
    const id = json.value.id

    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {})
      }
    })
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(resJson.value.message).toBe('Category successfully deleted')
    expect(resJson.value.deleted.id).toBe(id)
  })

  it('should return 404 for non-existent category', async () => {
    const cookie = await signInAsAdmin()
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const response = await fetch(`${baseUrl}/${fakeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {})
      }
    })
    expect(response.status).toBe(404)
    const resJson = await response.json()
    expect(resJson.error.message).toMatch(/not found/i)
  })
})
