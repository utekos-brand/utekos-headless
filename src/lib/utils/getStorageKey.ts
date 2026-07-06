// src/lib/utils/getStorageKey.ts

import type { CaptureBody } from 'types/tracking/meta'

export function getStorageKey(body: CaptureBody): string | undefined {
  if (body.cartId) {
    const match = body.cartId.match(/Cart\/([a-zA-Z0-9]+)/)
    if (match && match[1]) {
      return match[1]
    }
  }

  if (!body.checkoutUrl) return undefined

  try {
    const url = new URL(body.checkoutUrl)

    const keyToken = url.searchParams.get('key')
    if (keyToken && /^[a-f0-9]{32}$/i.test(keyToken)) return keyToken

    const paramToken = url.searchParams.get('token')
    if (paramToken) return paramToken

    const parts = url.pathname.split('/').filter(Boolean)
    const checkoutIndex = parts.findIndex(p => p === 'checkouts')
    if (checkoutIndex !== -1) {
      const potentialToken = parts[checkoutIndex + 1]
      if (potentialToken && /^[a-f0-9]{32}$/i.test(potentialToken)) {
        return potentialToken
      }
    }
  } catch (e) {
    console.error('Error parsing checkout URL:', e)
  }

  return undefined
}
