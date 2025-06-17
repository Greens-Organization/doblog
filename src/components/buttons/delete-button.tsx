import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

interface DeleteButtonProps {
  action: () => void
}

export function DeleteButton({ action }: DeleteButtonProps) {
  const [isLoading, setIsLoading] = useTransition()

  return (
    <Button
      disabled={isLoading}
      className="cursor-pointer"
      variant="destructive"
      type="button"
      onClick={() => setIsLoading(action)}
    >
      Deletar
    </Button>
  )
}
