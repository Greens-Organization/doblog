import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CheckCircle, Mail } from 'lucide-react'

export default function Page() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto size-16 bg-secondary rounded-full flex items-center justify-center">
          <CheckCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Confirm Your Account</CardTitle>
          <CardDescription className="text-base">
            We've sent a confirmation email to verify your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary border rounded-lg p-4 flex items-start space-x-3">
          <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium ">Check your email</p>
            <p className="text-sm text-muted-foreground">
              Click the confirmation link in the email we sent to complete your
              account setup.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
