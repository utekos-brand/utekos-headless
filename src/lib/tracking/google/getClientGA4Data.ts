import { getGaClientIdFromBrowser } from './getGaClientIdFromBrowser'
import { getGaSessionIdFromBrowser } from './getGaSessionIdFromBrowser'
import type { GA4DataPayload } from 'types/tracking/google/GA4DataPayload'

const GTAG_GET_TIMEOUT_MS = 800

export function getClientGA4Data(): GA4DataPayload | undefined {
  const clientId = getGaClientIdFromBrowser()
  const sessionId = getGaSessionIdFromBrowser()

  if (!clientId && !sessionId) {
    return undefined
  }

  return {
    ...(clientId ? { client_id: clientId } : {}),
    ...(sessionId ? { session_id: sessionId } : {})
  }
}

function getGoogleAnalyticsTargetId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
}

function getGtagField(fieldName: 'client_id' | 'session_id') {
  return new Promise<string | undefined>(resolve => {
    if (typeof window === 'undefined' || !window.gtag) {
      resolve(undefined)
      return
    }

    const targetId = getGoogleAnalyticsTargetId()
    if (!targetId) {
      resolve(undefined)
      return
    }

    let settled = false
    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(undefined)
      }
    }, GTAG_GET_TIMEOUT_MS)

    window.gtag('get', targetId, fieldName, value => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(timeout)
      if (typeof value === 'string' && value.trim()) {
        resolve(value.trim())
        return
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        resolve(String(value))
        return
      }

      resolve(undefined)
    })
  })
}

export async function resolveClientGA4Data(): Promise<GA4DataPayload | undefined> {
  const cookieData = getClientGA4Data()

  if (cookieData?.client_id && cookieData.session_id) {
    return cookieData
  }

  const [clientId, sessionId] = await Promise.all([
    cookieData?.client_id ? Promise.resolve(cookieData.client_id) : getGtagField('client_id'),
    cookieData?.session_id ? Promise.resolve(cookieData.session_id) : getGtagField('session_id')
  ])

  if (!clientId && !sessionId) {
    return cookieData
  }

  return {
    ...(clientId ? { client_id: clientId } : {}),
    ...(sessionId ? { session_id: sessionId } : {})
  }
}
