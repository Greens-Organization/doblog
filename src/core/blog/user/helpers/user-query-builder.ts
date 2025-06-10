import { sql } from 'drizzle-orm'

export class UserQueryBuilder {
  private conditions: string[] = []
  private params: Record<string, unknown> = {}
  private paramCounter = 0

  addCategoryFilter(categoryId: string): this {
    const paramName = `category_${++this.paramCounter}`
    this.conditions.push(`uc.category_id = $${paramName}`)
    this.params[paramName] = categoryId
    return this
  }

  addNameFilter(name: string): this {
    const paramName = `name_${++this.paramCounter}`
    this.conditions.push(`u.name ILIKE $${paramName}`)
    this.params[paramName] = `%${name}%`
    return this
  }

  addEmailFilter(email: string): this {
    const paramName = `email_${++this.paramCounter}`
    this.conditions.push(`u.email ILIKE $${paramName}`)
    this.params[paramName] = `%${email}%`
    return this
  }

  build(): { whereClause: string; params: Record<string, unknown> } {
    const whereClause =
      this.conditions.length > 0 ? `WHERE ${this.conditions.join(' AND ')}` : ''

    return { whereClause, params: this.params }
  }
}

// Function to build the main query
export function buildUserListQuery(
  whereClause: string,
  limit: number,
  offset: number
): ReturnType<typeof sql> {
  return sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.email_verified as "emailVerified",
      u.image,
      u.role,
      u.created_at as "createdAt",
      u.updated_at as "updatedAt",
      
      -- Total post count
      COALESCE(
        (SELECT COUNT(*)::integer 
         FROM post p 
         WHERE p.author_id = u.id), 0
      ) as "totalPosts",
      
      -- Count of published posts
      COALESCE(
        (SELECT COUNT(*)::integer 
         FROM post p 
         WHERE p.author_id = u.id AND p.status = 'published'), 0
      ) as "totalPostPublished",
      
      -- Count of draft posts
      COALESCE(
        (SELECT COUNT(*)::integer 
         FROM post p 
         WHERE p.author_id = u.id AND p.status = 'draft'), 0
      ) as "totalPostDraft",
      
      -- Categories associated with the user
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'description', c.description
          )
        )
        FROM user_to_category uc2
        JOIN category c ON c.id = uc2.category_id
        WHERE uc2.user_id = u.id), '[]'::json
      ) as categories
      
    FROM "user" u
    LEFT JOIN user_to_category uc ON uc.user_id = u.id
    ${sql.raw(whereClause)}
    GROUP BY u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `
}

// Function to count the total number of users
export function buildCountQuery(whereClause: string): ReturnType<typeof sql> {
  return sql`
    SELECT COUNT(DISTINCT u.id)::integer as total
    FROM "user" u
    LEFT JOIN user_to_category uc ON u.id = uc.user_id
    ${sql.raw(whereClause)}
  `
}
