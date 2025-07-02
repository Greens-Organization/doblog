import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <Card className="max-w-md w-full rounded-none border-dashed">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Password Reset Email Sent
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          We sent a password reset link to your email. Check your inbox and
          follow the instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="bg-secondary border rounded-lg p-4 flex items-start space-x-3">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
            </div>
          </div>
          <p className="text-sm italic text-muted-foreground">
            Check spam/junk if you don’t see the email.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-dashed">
        <p className="text-sm text-muted-foreground">
          Have an account?{' '}
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
