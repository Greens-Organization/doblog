import { sanitizeValue } from '@/infra/helpers/sanitize'

export function buildCategoryQueryParts({
  isAdmin,
  userId,
  conditions
}: {
  isAdmin: boolean
  userId?: string
  conditions: string[]
}) {
  let joinClause = ''
  let whereClause = ''

  if (isAdmin) {
    whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  } else {
    joinClause = 'JOIN user_to_category utc ON utc.category_id = c.id'
    conditions.push(`utc.user_id = '${sanitizeValue(userId!)}'`)
    whereClause = `WHERE ${conditions.join(' AND ')}`
  }

  return { joinClause, whereClause }
}
