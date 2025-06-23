import { cn } from '@/infra/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'

function InputPassword({ className, ...props }: React.ComponentProps<'input'>) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <input
        type={open ? 'text' : 'password'}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
      <Button
        size="icon"
        variant="ghost"
        type="button"
        className="rounded-l-none absolute right-0 top-0 text-muted-foreground"
        onClick={() => setOpen((b) => !b)}
      >
        <EyeClosed
          size={16}
          className={cn(
            !open && 'opacity-0 scale-50',
            'transition-all duration-300 absolute'
          )}
        />
        <Eye
          size={16}
          className={cn(
            open && 'opacity-0 scale-50',
            'transition-all duration-300 absolute'
          )}
        />
      </Button>
    </div>
  )
}

export { InputPassword }
