'use client'

import { useContext } from 'react'
import { ConsentContext } from './CookiebotConsentProvider'
import type { ConsentCategory } from './cookiebotConsentSchema'

export function useConsent() {
  const context = useContext(ConsentContext)

  if (context === undefined) {
    throw new Error('useConsent must be used within a CookiebotConsentProvider')
  }

  return context
}

export function useConsentFor(category: ConsentCategory): boolean {
  const { consent } = useConsent()
  return consent[category]
}

export function useConsentForService(serviceName: string): boolean {
  const { consent } = useConsent()
  return consent.services[serviceName] === true
}
