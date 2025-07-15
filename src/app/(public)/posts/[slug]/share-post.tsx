'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

interface SharePostProps {
  title: string
  description: string
}

export function SharePost({ description, title }: SharePostProps) {
  const canShare = useMemo(
    () => typeof window !== 'undefined' && navigator.share,
    []
  )

  async function sharePost() {
    if (!canShare) {
      navigator.clipboard.writeText(location.toString())
      toast.success('Post link copied!')
      return
    }

    navigator.share({ text: description, title, url: location.toString() })
  }

  return (
    <Button variant="ghost" onClick={sharePost}>
      <Share2 />
    </Button>
  )
}
