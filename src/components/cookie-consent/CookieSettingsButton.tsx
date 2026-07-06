'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/className'
import { useConsent } from './useConsent'

export default function CookieSettingsButton() {
  const { openSettings } = useConsent()

  return (
    <button
      type='button'
      onClick={openSettings}
      className={cn(
        buttonVariants({ variant: 'link' }),
        '/80 hover:text-sidebar-foreground h-auto p-0 text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground'
      )}
    >
      Innstillinger for informasjonskapsler
    </button>
  )
}
