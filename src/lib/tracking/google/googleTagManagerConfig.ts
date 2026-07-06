import { USERCENTRICS_SGTM_ORIGIN } from '@/components/cookie-consent/usercentricsConfig'

export const GOOGLE_TAG_MANAGER_ID = process.env.NEXT_PUBLIC_GOOGLE_GTM_ID || 'GTM-5TWMJQFP'

export const GTM_SGTM_SCRIPT_URL = `${USERCENTRICS_SGTM_ORIGIN}/gtm.js?id=${encodeURIComponent(GOOGLE_TAG_MANAGER_ID)}`

/** Optional override. Only set this after regenerating and verifying the resilient loader in Usercentrics. */
export const GTM_RESILIENT_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GTM_RESILIENT_SCRIPT_URL?.trim() || ''

export const GTM_RESILIENT_NOSCRIPT_URL =
  process.env.NEXT_PUBLIC_GTM_RESILIENT_NOSCRIPT_URL?.trim()
  || `${USERCENTRICS_SGTM_ORIGIN}/ns.html?id=${encodeURIComponent(GOOGLE_TAG_MANAGER_ID)}`

export const SHOULD_LOAD_GOOGLE_TAG_MANAGER =
  (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview')
  || process.env.NEXT_PUBLIC_ENABLE_GTM_IN_DEV === '1'
