import { ForgotPasswordForm } from '@/components/auth-form'
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

export default function Page() {
  return (
    <Card className="max-w-md w-full rounded-none border-dashed">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Forgot Password</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below and we will send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className={cn('w-full gap-2 flex', 'justify-between flex-col')}>
            <ForgotPasswordForm />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-dashed">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
