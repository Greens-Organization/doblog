import { UserRole } from '@/core/blog/user/dto'
import { zod } from '@/infra/lib/zod'
import { passwordRegularValidator } from '../../primitives'

export const createFirstUserSchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255, { error: 'The name must have at most 255 characters' }),
    email: zod.email('Email must be a valid email address'),
    password: passwordRegularValidator()
  })
}

export const createUserSchema = () => {
  return zod.object({
    name: zod
      .string({ error: 'Name must be a valid string' })
      .min(1, { error: 'The name must have at least 1 character' })
      .max(255, { error: 'The name must have at most 255 characters' }),
    email: zod.email('Email must be a valid email address'),
    role: zod.enum(UserRole, 'Role must be a valid user role'),
    categories: zod.uuid().array().min(1, 'At least one category is required')
  })
}
