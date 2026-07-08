'use client'

import { useEffect } from 'react'
import { PostHogProvider, usePostHog } from '@posthog/react'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { COOKIEBOT_POSTHOG_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const POSTHOG_API_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!
const POSTHOG_UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST!
const POSTHOG_SESSION_REPLAY_ENABLED = process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY !== '0'

function PostHogConsentLifecycle() {
  const postHog = usePostHog()

  useEffect(() => {
    postHog.opt_in_capturing()
    if (POSTHOG_SESSION_REPLAY_ENABLED) {
      postHog.startSessionRecording()
    }

    return () => {
      postHog.stopSessionRecording()
      postHog.reset(true)
      postHog.opt_out_capturing()
    }
  }, [postHog])

  return null
}

export function PostHogClientProvider({ children }: { children: React.ReactNode }) {
  const hasPostHogConsent = useConsentForService(COOKIEBOT_POSTHOG_SERVICE_NAME)

  if (!hasPostHogConsent || !POSTHOG_API_KEY || !POSTHOG_API_HOST) {
    return null
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        api_host: POSTHOG_API_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: 'identified_only',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: !POSTHOG_SESSION_REPLAY_ENABLED,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '*',
          maskCapturedNetworkRequestFn: request => {
            if (request.name) {
              const urlWithoutQuery = request.name
                .replace(/([?&](token|auth|email|phone|session|checkout|cart|customer)=)[^&]+/gi, '$1[REDACTED]')
                .split('?')[0]
              request.name = urlWithoutQuery ?? request.name
            }

            return request
          }
        }
      }}
    >
      <PostHogConsentLifecycle />
      {children}
    </PostHogProvider>
  )
}
