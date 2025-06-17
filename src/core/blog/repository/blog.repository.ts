import { db } from '@/infra/db'

class BlogRepository {
  async getBlog() {
    return await db.query.organization.findFirst()
  }
}

export const blogRepository = new BlogRepository()
