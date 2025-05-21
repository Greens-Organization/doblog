import { constants } from '@test/e2e/helpers/constants'
import { signInAsAdmin } from '@test/e2e/helpers/sign-in-admin'
import { describe, expect, it } from 'bun:test'
import { createCategory } from './helper/create-category'

describe('Category - List', () => {
  it('should list all categories', async () => {
    const response = await fetch(`${constants.SERVER}/api/v1/blog/category`)
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(Array.isArray(resJson.value)).toBe(true)
  })

  it('should filter categories by slug', async () => {
    const cookie = await signInAsAdmin()
    const { categoryData } = await createCategory(cookie)
    const response = await fetch(
      `${constants.SERVER}/api/v1/blog/category?slug=${categoryData.slug}`
    )
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(resJson.value[0].slug).toBe(categoryData.slug)
  })

  it('should filter categories by name', async () => {
    const cookie = await signInAsAdmin()
    const { categoryData } = await createCategory(cookie)
    const response = await fetch(
      `${constants.SERVER}/api/v1/blog/category?name=${encodeURIComponent(categoryData.name)}`
    )
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(resJson.value[0].name).toBe(categoryData.name)
  })
})
