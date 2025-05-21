import { db } from '@/infra/db'
import { category } from '@/infra/db/schemas/blog/category'

export async function POST(request: Request) {
  const bodyData = await request.json()

  try {
    const data = await db.insert(category).values({
      name: bodyData.name,
      slug: bodyData.slug,
      description: bodyData.description
    })

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    // console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
