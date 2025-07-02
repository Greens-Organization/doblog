import { zod } from '@/infra/lib/zod'
import { passwordWeakValidator } from '../../primitives'

export const signInSchema = zod.object({
  email: zod.email(),
  password: passwordWeakValidator()
})
