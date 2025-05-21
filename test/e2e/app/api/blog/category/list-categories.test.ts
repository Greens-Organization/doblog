import { describe, expect, it } from 'bun:test'
import { constants } from '@test/e2e/helpers/constants'
import { signInAsAdmin } from '@test/e2e/helpers/sign-in-admin'
import { createCategory } from './helper/create-category'

describe('Category - List', () => {
  it.skip('e2e: should list all categories', async () => {
    const response = await fetch(`${constants.SERVER}/api/v1/blog/category`)
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(Array.isArray(resJson.value)).toBe(true)
  })

  it.skip('e2e: should filter categories by slug', async () => {
    const cookie = await signInAsAdmin()
    const { categoryData } = await createCategory(cookie)
    const response = await fetch(
      `${constants.SERVER}/api/v1/blog/category?slug=${categoryData.slug}`
    )
    expect(response.status).toBe(200)
    const resJson = await response.json()
    expect(resJson.value[0].slug).toBe(categoryData.slug)
  })

  it.skip('e2e: should filter categories by name', async () => {
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
