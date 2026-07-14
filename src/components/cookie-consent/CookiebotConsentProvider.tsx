'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { defaultConsentState } from './defaultConsentState'
import { createCookiebotConsentState } from './createCookiebotConsentState'
import { readStoredConsentState } from './readStoredConsentState'
import { setLatestConsentServices } from '@/lib/tracking/consent/latestConsentServices'
import { queueClarityConsent } from '@/lib/tracking/clarity/queueClarityConsent'
import type { CookiebotConsentState } from './cookiebotConsentSchema'

interface ConsentContextType {
  consent: CookiebotConsentState
  openSettings: () => void
}

export const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

function updateGoogleConsentMode(consent: CookiebotConsentState) {
  window.gtag?.('consent', 'update', {
    analytics_storage: consent.statistics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.preferences ? 'granted' : 'denied',
    personalization_storage: consent.preferences ? 'granted' : 'denied',
    security_storage: 'granted'
  })
}

function updateMicrosoftConsentMode(consent: CookiebotConsentState) {
  window.uetq = window.uetq || []
  window.uetq.push('consent', 'update', {
    ad_storage: consent.marketing ? 'granted' : 'denied'
  })
}

function updateClarityConsentMode(consent: CookiebotConsentState) {
  queueClarityConsent({
    source: 'cookiebot',
    ad_Storage: consent.marketing ? 'granted' : 'denied',
    analytics_Storage: consent.statistics ? 'granted' : 'denied'
  })
}

function persistConsent(consent: CookiebotConsentState) {
  void fetch('/api/consent-snapshots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consent),
    keepalive: true
  }).catch(error => {
    console.error('Failed to persist Cookiebot consent:', error)
  })
}

function hasOpenApplicationOverlay() {
  return Boolean(
    document.querySelector(
      '[data-slot="dialog-content"], [data-slot="drawer-content"], [data-slot="sheet-content"]'
    )
  )
}

function releaseStaleConsentScrollLock() {
  window.setTimeout(() => {
    if (hasOpenApplicationOverlay()) {
      return
    }

    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = ''
    }

    if (document.documentElement.style.overflow === 'hidden') {
      document.documentElement.style.overflow = ''
    }
  }, 250)
}

function readCookiebotRuntimeConsent(): CookiebotConsentState | null {
  if (!window.Cookiebot?.consent) {
    return null
  }

  return createCookiebotConsentState({
    preferences: window.Cookiebot.consent.preferences,
    statistics: window.Cookiebot.consent.statistics,
    marketing: window.Cookiebot.consent.marketing
  })
}

export function CookiebotConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookiebotConsentState>(defaultConsentState)

  useEffect(() => {
    const syncCookiebotConsent = () => {
      const nextConsent = readCookiebotRuntimeConsent() ?? readStoredConsentState()

      if (!nextConsent) {
        return
      }

      setConsent(nextConsent)
      setLatestConsentServices(nextConsent.services)
      updateGoogleConsentMode(nextConsent)
      updateMicrosoftConsentMode(nextConsent)
      updateClarityConsentMode(nextConsent)
      persistConsent(nextConsent)
      releaseStaleConsentScrollLock()
    }

    const initialSyncTimer = window.setTimeout(syncCookiebotConsent, 0)
    window.addEventListener('CookiebotOnConsentReady', syncCookiebotConsent)
    window.addEventListener('CookiebotOnAccept', syncCookiebotConsent)
    window.addEventListener('CookiebotOnDecline', syncCookiebotConsent)

    return () => {
      window.clearTimeout(initialSyncTimer)
      window.removeEventListener('CookiebotOnConsentReady', syncCookiebotConsent)
      window.removeEventListener('CookiebotOnAccept', syncCookiebotConsent)
      window.removeEventListener('CookiebotOnDecline', syncCookiebotConsent)
    }
  }, [])

  const openSettings = () => {
    window.Cookiebot?.renew()
  }

  return <ConsentContext.Provider value={{ consent, openSettings }}>{children}</ConsentContext.Provider>
}
