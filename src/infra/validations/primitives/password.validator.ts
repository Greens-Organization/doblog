import { zod } from '@/infra/lib/zod'

export function passwordWeakValidator() {
  return zod
    .string('Please enter a password.')
    .min(8, 'Password must be at least 8 characters long')
}

export function passwordRegularValidator() {
  return zod
    .string('Please enter a password.')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, {
      message: 'Password must contain at least one letter'
    })
    .regex(/[0-9]/, 'Password must contain at least one number')
}

export function passwordStrongValidator() {
  return zod
    .string('Please enter a password.')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter'
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter'
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number'
    })
    .regex(/[^A-Za-z0-9]/, {
      message: 'Password must contain at least one special character'
    })
}

export const passwordValidatorFactory = {
  weak: passwordWeakValidator,
  regular: passwordRegularValidator,
  strong: passwordStrongValidator
}

export type PasswordValidatorProps = Partial<{
  force: 'weak' | 'regular' | 'strong'
}>

export function passwordValidator({
  force = 'regular'
}: PasswordValidatorProps) {
  return passwordValidatorFactory[force]()
}
