'use client'

import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/className'
import {
  BANNER_STORAGE_KEY,
  isBannerDismissed
} from './announcementBannerConfig'
import { dismissAnnouncementBanner } from './dismissAnnouncementBanner'

type AnnouncementBannerClientProps = {
  children: React.ReactNode
}

export function AnnouncementBannerClient({
  children
}: AnnouncementBannerClientProps) {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const dismissedTimestamp = window.localStorage.getItem(
      BANNER_STORAGE_KEY
    )

    if (!isBannerDismissed(dismissedTimestamp)) {
      return
    }

    void dismissAnnouncementBanner().then(() => {
      router.refresh()
    })
  }, [router])

  const handleDismiss = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setIsExiting(true)
    window.localStorage.setItem(
      BANNER_STORAGE_KEY,
      Date.now().toString()
    )

    window.setTimeout(() => {
      void dismissAnnouncementBanner().then(() => {
        router.refresh()
      })
    }, 500)
  }

  return (
    <div
      className={cn(
        'animate-slide-in-do relative z-40 text-lg font-medium hover:brightness-105',
        isExiting && 'animate-slide-out-up'
      )}
    >
      {children}

      <Button
        variant='default'
        size='sm'
        onClick={handleDismiss}
        className='absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center'
      >
        <XIcon className='size-4 cursor-pointer' />
      </Button>
    </div>
  )
}
