import { account } from './schemas/auth/account'
import { session } from './schemas/auth/session'
import { user } from './schemas/auth/user'
import { verification } from './schemas/auth/verification'
import { category } from './schemas/blog/category'
import { post } from './schemas/blog/post'
import { subcategory } from './schemas/blog/subcategory'
import { tag } from './schemas/blog/tag'

export const schemas = {
  // better auth
  ...user,
  ...session,
  ...account,
  ...verification,

  // blog
  ...post,
  ...category,
  ...subcategory,
  ...tag
}
