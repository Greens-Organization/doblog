'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/infra/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignInForm, SignUpForm } from './auth-form'

export default function AuthCard({
  description,
  mode = 'sign-in',
  title
}: {
  title: string
  description: string
  mode?: 'sign-in' | 'sign-up'
}) {
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get('callbackURL') || ''

  return (
    <Card className="max-w-md w-full rounded-none border-dashed">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className={cn('w-full gap-2 flex', 'justify-between flex-col')}>
            {mode === 'sign-in' ? <SignInForm /> : <SignUpForm />}
          </div>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          'flex border-t border-dashed pt-4 text-sm text-muted-foreground',
          mode === 'sign-up' ? 'justify-center' : 'justify-between'
        )}
      >
        <p>
          {mode === 'sign-in' ? (
            <>
              Don't have an account?{' '}
              <Link
                href={`/sign-up?callbackURL=${callbackURL}`}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                href={`/sign-in?callbackURL=${callbackURL}`}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
        {mode === 'sign-in' && (
          <Link
            href="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            Forgot password
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
