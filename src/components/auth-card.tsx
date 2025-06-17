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
      <CardFooter className="flex justify-center border-t border-dashed pt-4">
        <p className="text-sm text-muted-foreground">
          {mode === 'sign-in' ? (
            <>
              Don't have an account?{' '}
              <Link
                href="/sign-up"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
