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
        'p-0 h-auto text-sm text-sidebar-foreground/80 dark:text-dark-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground dark:hover:text-dark-sidebar-foreground'
      )}
    >
      Innstillinger for informasjonskapsler
    </button>
  )
}
