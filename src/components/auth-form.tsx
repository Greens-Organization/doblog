'use client'
import { authClient } from '@/infra/lib/better-auth/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const callbackURL = searchParams.get('callbackURL') || '/'

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const email = formData.get('email') || ''
        const password = formData.get('password') || ''

        const { error } = await authClient.signIn.email({
          email: email as string,
          password: password as string,
          callbackURL: callbackURL
        })

        setIsLoading(false)
        if (error) {
          toast.error(error.message)
          return
        }
        router.push(callbackURL)
      }}
    >
      <Input placeholder="Email" name="email" type="email" required />
      <Input placeholder="Password" name="password" type="password" required />
      <Button
        className="w-full cursor-pointer"
        type="submit"
        disabled={isLoading}
      >
        Continuar
      </Button>
    </form>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const callbackURL = searchParams.get('callbackURL') || '/sign-in'

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const email = formData.get('email') || ''
        const name = formData.get('name') || ''
        const password = formData.get('password') || ''

        const { error } = await authClient.signUp.email({
          email: email as string,
          name: name as string,
          password: password as string,
          callbackURL: callbackURL
        })

        setIsLoading(false)
        if (error) {
          toast.error(error.message)
          return
        }
        router.push(callbackURL)
      }}
    >
      <Input placeholder="Name" name="name" required />
      <Input placeholder="Email" name="email" type="email" required />
      <Input placeholder="Password" name="password" type="password" required />
      <Button
        className="w-full cursor-pointer"
        type="submit"
        disabled={isLoading}
      >
        Continuar
      </Button>
    </form>
  )
}
