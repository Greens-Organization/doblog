import { createAccessControl } from 'better-auth/plugins/access'

const statement = {
  post: ['read', 'create', 'update', 'archive', 'publish'],
  category: ['read', 'create', 'update', 'delete'],
  subcategory: ['read', 'create', 'update', 'delete'],
  user: ['read', 'create', 'update', 'delete']
} as const

const ac = createAccessControl(statement)

const admin = ac.newRole({
  post: [...statement.post],
  category: [...statement.category],
  subcategory: [...statement.subcategory],
  user: [...statement.user]
})

const editor = ac.newRole({
  post: ['create', 'update', 'archive', 'publish']
})

export { ac, admin, editor }
