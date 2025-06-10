import { createAccessControl } from 'better-auth/plugins/access'

const statement = {
  blog: ['read', 'update', 'delete'],
  post: [
    'read',
    'list',
    'create',
    'update',
    'archive',
    'publish',
    'moveToDraft'
  ],
  category: ['read', 'list', 'create', 'update', 'delete'],
  subcategory: ['read', 'list', 'create', 'update', 'delete'],
  user: ['read', 'list', 'create', 'update', 'delete']
} as const

const ac = createAccessControl(statement)

const admin = ac.newRole({
  blog: [...statement.blog],
  post: [...statement.post],
  category: [...statement.category],
  subcategory: [...statement.subcategory],
  user: [...statement.user]
})

const editor = ac.newRole({
  blog: ['read'],
  post: ['read', 'create', 'update', 'archive', 'publish', 'moveToDraft']
})

export { ac, admin, editor }
