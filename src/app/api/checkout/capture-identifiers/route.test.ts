import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import type { CaptureContext } from 'types/tracking/capture'

type CaptureRouteHandler = (
  request: NextRequest,
  dependencies: {
    syncCartMarketingAttributes: (cartId: string | null | undefined) => Promise<unknown>
    captureIdentifiers: (
      tokens: string[],
      body: Record<string, unknown>,
      context: CaptureContext
    ) => Promise<{ success: true }>
  }
) => Promise<Response>

function createRequest(consent: { statistics: boolean; marketing: boolean }): NextRequest {
  const cookieValue = encodeURIComponent(JSON.stringify({
    necessary: true,
    preferences: false,
    statistics: consent.statistics,
    marketing: consent.marketing,
    method: 'explicit'
  }))

  return new NextRequest('https://utekos.no/api/checkout/capture-identifiers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `CookieConsent=${cookieValue}`
    },
    body: JSON.stringify({
      cartId: 'gid://shopify/Cart/cart-token',
      checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/checkout-token',
      eventId: 'ic_test',
      gaClientId: '123.456',
      gaSessionId: '789'
    })
  })
}

test('checkout route captures GA identifiers with statistics-only consent', async () => {
  let routeModule: Record<string, unknown> = {}
  try {
    routeModule = await import('./handleCheckoutIdentifierCapture') as Record<string, unknown>
  } catch {}
  const handler = routeModule.handleCheckoutIdentifierCapture as CaptureRouteHandler
  const contexts: CaptureContext[] = []
  let marketingSyncCount = 0

  assert.equal(typeof handler, 'function')

  const response = await handler(createRequest({ statistics: true, marketing: false }), {
    syncCartMarketingAttributes: async () => {
      marketingSyncCount += 1
    },
    captureIdentifiers: async (_tokens, _body, context) => {
      contexts.push(context)
      return { success: true }
    }
  })

  assert.equal(response.status, 200)
  assert.equal(contexts.length, 1)
  assert.equal(contexts[0]?.consentProvenance.services.googleAnalytics, true)
  assert.equal(contexts[0]?.consentProvenance.services.googleAds, false)
  assert.equal(marketingSyncCount, 0)
})

test('checkout route fails closed without provider-specific consent', async () => {
  let routeModule: Record<string, unknown> = {}
  try {
    routeModule = await import('./handleCheckoutIdentifierCapture') as Record<string, unknown>
  } catch {}
  const handler = routeModule.handleCheckoutIdentifierCapture as CaptureRouteHandler
  let captureCount = 0

  assert.equal(typeof handler, 'function')

  const response = await handler(createRequest({ statistics: false, marketing: false }), {
    syncCartMarketingAttributes: async () => null,
    captureIdentifiers: async () => {
      captureCount += 1
      return { success: true }
    }
  })

  assert.equal(response.status, 204)
  assert.equal(captureCount, 0)
})
