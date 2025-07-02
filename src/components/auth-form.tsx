'use client'
import {
  DicebearTypes,
  generateRandomURLAvatar
} from '@/infra/helpers/dicebear'
import { authClient } from '@/infra/lib/better-auth/auth-client'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema
} from '@/infra/validations/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { DefaultField } from './form/default-field'
import { Button } from './ui/button'
import { Form } from './ui/form'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const form = useForm({ resolver: zodResolver(signInSchema) })

  const callbackURL = searchParams.get('callbackURL') || '/'

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          const { error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: callbackURL
          })

          if (error) {
            toast.error(error.message)
            return
          }
          router.push(callbackURL)
        })}
      >
        <DefaultField name="email" placeholder="Email" type="email" />
        <DefaultField name="password" placeholder="Password" type="password" />

        <Button
          className="w-full cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          Continuar
        </Button>
      </form>
    </Form>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm({ resolver: zodResolver(signUpSchema) })

  const callbackURL = searchParams.get('callbackURL') || '/sign-in'

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          // TODO: REMOVE ROLE FROM HERE WARNING!!!!!!!!!!!!!!!
          const { error } = await authClient.signUp.email({
            email: data.email,
            name: data.name,
            password: data.password,
            role: 'editor',
            callbackURL: callbackURL,
            image: generateRandomURLAvatar({ type: DicebearTypes.notionists })
          })

          if (error) {
            toast.error(error.message)
            return
          }
          router.push(`/sign-up/confirm-account?callbackURL=${callbackURL}`)
        })}
      >
        <DefaultField name="name" placeholder="Name" />
        <DefaultField name="email" placeholder="Email" type="email" />
        <DefaultField name="password" placeholder="Password" type="password" />
        <Button
          className="w-full cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          Continuar
        </Button>
      </form>
    </Form>
  )
}

export function ForgotPasswordForm() {
  const router = useRouter()

  const form = useForm({ resolver: zodResolver(forgotPasswordSchema()) })

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          const { error } = await authClient.forgetPassword({
            email: data.email,
            redirectTo: '/reset-password'
          })

          if (error) {
            toast.error(error.message)
            return
          }
          router.push('/reset-password')
        })}
      >
        <DefaultField name="email" placeholder="Email" type="email" />
        <Button
          className="w-full cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          Continuar
        </Button>
      </form>
    </Form>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useParams()

  const form = useForm({ resolver: zodResolver(resetPasswordSchema) })

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (data) => {
          toast.loading('Resetting password...')
          const { error } = await authClient.resetPassword({
            newPassword: data.password,
            token: params.code as string
          })

          toast.dismiss()
          if (error) {
            toast.error(error.message)
            return
          }
          toast.success('Password reset successfully.')
          router.push('/sign-in')
        })}
      >
        <DefaultField
          placeholder="New Password"
          name="password"
          type="password"
        />
        <DefaultField
          placeholder="Confirm New Password"
          name="confirm"
          type="password"
        />
        <Button
          className="w-full cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          Continuar
        </Button>
      </form>
    </Form>
  )
}
