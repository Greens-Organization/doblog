import { zod } from '@/infra/lib/zod'
import {
  passwordRegularValidator,
  passwordWeakValidator
} from '../../primitives'

export const updatePasswordSchema = zod
  .object({
    current: passwordWeakValidator(),
    password: passwordRegularValidator(),
    confirm: zod.string()
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm']
  })
