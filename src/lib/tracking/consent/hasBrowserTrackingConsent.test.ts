import assert from 'node:assert/strict'
import test from 'node:test'
import { hasBrowserTrackingConsent } from './hasBrowserTrackingConsent'

type CheckoutConsentPolicy = (hasConsent: (serviceName: string) => boolean) => boolean

test('accepts PostHog-only statistics consent for ledger observation', () => {
  assert.equal(hasBrowserTrackingConsent({
    google: false,
    meta: false,
    microsoft: false,
    posthog: true
  }), true)
})

test('rejects a browser tracking event when no destination has consent', () => {
  assert.equal(hasBrowserTrackingConsent({
    google: false,
    meta: false,
    microsoft: false,
    posthog: false
  }), false)
})

test('captures checkout identifiers for each authorized attribution service', async () => {
  const consentModule = await import('./hasBrowserTrackingConsent') as Record<string, unknown>
  const shouldCaptureCheckoutIdentifiers = consentModule.shouldCaptureCheckoutIdentifiers

  assert.equal(typeof shouldCaptureCheckoutIdentifiers, 'function')

  const policy = shouldCaptureCheckoutIdentifiers as CheckoutConsentPolicy
  const authorizedServices = [
    'Google Analytics',
    'Google Ads',
    'Facebook Pixel',
    'Microsoft Advertising Remarketing'
  ]

  for (const authorizedService of authorizedServices) {
    assert.equal(
      policy(serviceName => serviceName === authorizedService),
      true,
      authorizedService
    )
  }
})

test('does not capture checkout identifiers without an authorized attribution service', async () => {
  const consentModule = await import('./hasBrowserTrackingConsent') as Record<string, unknown>
  const shouldCaptureCheckoutIdentifiers = consentModule.shouldCaptureCheckoutIdentifiers

  assert.equal(typeof shouldCaptureCheckoutIdentifiers, 'function')
  assert.equal((shouldCaptureCheckoutIdentifiers as CheckoutConsentPolicy)(() => false), false)
})
