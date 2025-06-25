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
    'moveToDraft',
    'changeAuthor'
  ],
  category: ['read', 'list', 'create', 'update', 'delete'],
  subcategory: ['read', 'list', 'create', 'update', 'delete'],
  user: ['read', 'list', 'create', 'update', 'delete', 'changeCategories'],
  profile: ['update'],
  invitation: ['create']
} as const

const ac = createAccessControl(statement)

const admin = ac.newRole({
  blog: [...statement.blog],
  post: [...statement.post],
  category: [...statement.category],
  subcategory: [...statement.subcategory],
  user: [...statement.user],
  profile: [...statement.profile],
  invitation: [...statement.invitation]
})

const editor = ac.newRole({
  blog: ['read'],
  category: ['list', 'read'],
  subcategory: ['list', 'read'],
  post: [
    'read',
    'create',
    'list',
    'update',
    'archive',
    'publish',
    'moveToDraft'
  ],
  profile: ['update']
})

export { ac, admin, editor }
