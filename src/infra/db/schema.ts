import * as account from './schemas/auth/account'
import * as session from './schemas/auth/session'
import * as user from './schemas/auth/user'
import * as verification from './schemas/auth/verification'
import * as category from './schemas/blog/category'
import * as post from './schemas/blog/post'
import * as subcategory from './schemas/blog/subcategory'
import * as tag from './schemas/blog/tag'

export const schema = {
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
