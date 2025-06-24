import { Terminal } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'

interface DefaultErrorProps {
  status?: number
  message?: string
  description?: string
}

export function DefaultError({
  message = 'Unknown error occurred',
  status = 500,
  description = 'Server error encountered'
}: DefaultErrorProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md border-dashed border-2 rounded-none shadow-none">
        <CardHeader className="border-b border-dashed pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono">system_failure.sh</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-0 font-mono">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <span>status</span>
            </div>
            <div className="space-y-1 pl-6">
              <p className="text-3xl font-bold">{status}</p>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <span>error_trace</span>
            </div>
            <div className="pl-6 text-sm text-muted-foreground">
              <p className="truncate">{message}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6 border-t border-dashed mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            className="w-full rounded-none border-dashed"
          >
            Retry
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-none border-dashed"
          >
            back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
