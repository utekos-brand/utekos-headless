// src/lib/utils/getStorageKey.ts

import type { CaptureBody } from 'types/tracking/meta'

const ignoredPathTokens = new Set(['cart', 'checkouts', 'checkout'])

function addUniqueToken(tokens: string[], value: string | null | undefined): void {
  if (!value) return
  const token = value.trim()
  if (ignoredPathTokens.has(token.toLowerCase())) return
  if (!/^[a-zA-Z0-9_-]{8,}$/.test(token)) return
  if (!tokens.includes(token)) tokens.push(token)
}

function addCheckoutUrlTokens(tokens: string[], checkoutUrl: string): void {
  try {
    const url = new URL(checkoutUrl)

    addUniqueToken(tokens, url.searchParams.get('checkout_token'))
    addUniqueToken(tokens, url.searchParams.get('cart_token'))
    addUniqueToken(tokens, url.searchParams.get('token'))
    addUniqueToken(tokens, url.searchParams.get('key'))

    const parts = url.pathname.split('/').filter(Boolean)
    const checkoutIndex = parts.findIndex(p => p === 'checkouts')
    if (checkoutIndex !== -1) {
      addUniqueToken(tokens, parts[checkoutIndex + 1])
      addUniqueToken(tokens, parts[checkoutIndex + 2])
    }

    for (const part of parts) {
      addUniqueToken(tokens, part)
    }
  } catch (e) {
    console.error('Error parsing checkout URL:', e)
  }
}

export function getStorageKeys(body: CaptureBody): string[] {
  const tokens: string[] = []

  if (body.checkoutUrl) {
    addCheckoutUrlTokens(tokens, body.checkoutUrl)
  }

  if (body.cartId) {
    const cartIdWithoutQuery = body.cartId.split('?')[0] ?? ''
    const match = cartIdWithoutQuery.match(/Cart\/([a-zA-Z0-9_-]+)/)
    addUniqueToken(tokens, match?.[1])
  }

  return tokens
}

export function getStorageKey(body: CaptureBody): string | undefined {
  return getStorageKeys(body)[0]
}
