import { zod } from '@/infra/lib/zod'
import { passwordRegularValidator } from '../../primitives'
import { signInSchema } from './sign-in.validation'

export const signUpSchema = signInSchema.extend({
  name: zod
    .string({ error: 'Name must be a valid string' })
    .min(1, { error: 'The name must have at least 1 character' })
    .max(255, { error: 'The name must have at most 255 characters' }),
  password: passwordRegularValidator()
})
