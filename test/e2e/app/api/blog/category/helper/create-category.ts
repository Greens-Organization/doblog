import { constants } from '@test/e2e/helpers/constants'

const baseUrl = `${constants.SERVER}${constants.PREFIX}/blog/category`

export async function createCategory(
  cookie: string | null,
  data?: Partial<{ name: string; slug: string; description: string }>
) {
  const categoryData = {
    name: data?.name ?? 'Test Category',
    slug:
      data?.slug ?? `test-category-${Math.random().toString(36).slice(2, 8)}`,
    description: data?.description ?? 'Test description'
  }
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(categoryData)
  })
  const json = await response.json()
  return { response, json, categoryData }
}
