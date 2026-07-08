'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePostHog } from '@posthog/react'
import { getPostHogPageviewUrl } from '@/lib/tracking/posthog/getPostHogPageviewUrl'

export function PostHogConsentGate() {
  const postHog = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!postHog) return

    postHog.capture('$pageview', {
      $current_url: getPostHogPageviewUrl(window.location)
    })
  }, [pathname, postHog, searchParams])

  return null
}
