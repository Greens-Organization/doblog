import { zod } from '@/infra/lib/zod'

export const forgotPasswordSchema = () => {
  return zod.object({
    email: zod.email()
  })
}
