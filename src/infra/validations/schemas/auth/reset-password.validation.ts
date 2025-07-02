import { zod } from '@/infra/lib/zod'
import { passwordRegularValidator } from '../../primitives'

export const resetPasswordSchema = zod
  .object({
    password: passwordRegularValidator(),
    confirm: zod.string()
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm']
  })
