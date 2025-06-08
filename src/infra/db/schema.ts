import * as account from './schemas/auth/account'
import * as invitation from './schemas/auth/invitation'
import * as member from './schemas/auth/member'
import * as organization from './schemas/auth/organization'
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
  ...invitation,
  ...organization,
  ...member,

  // blog
  ...post,
  ...category,
  ...subcategory,
  ...tag
}
