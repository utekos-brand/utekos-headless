import assert from 'node:assert/strict'
import test from 'node:test'
import { createCookiebotConsentState } from '@/components/cookie-consent/createCookiebotConsentState'
import { buildConsentProvenance } from './buildConsentProvenance'

type CheckoutCapturePolicy = (provenance: ReturnType<typeof buildConsentProvenance>) => boolean

test('stores a versioned service map without copying the raw Cookiebot cookie', () => {
  const provenance = buildConsentProvenance(
    createCookiebotConsentState({ statistics: true, marketing: false }),
    new Date('2026-07-12T10:00:00.000Z')
  )

  assert.deepEqual(provenance, {
    schemaVersion: 1,
    source: 'cookiebot',
    capturedAt: '2026-07-12T10:00:00.000Z',
    services: {
      googleAnalytics: true,
      googleAds: false,
      meta: false,
      microsoftAdvertising: false
    }
  })
  assert.equal('rawCookie' in provenance, false)
})

test('authorizes checkout capture for each provider-specific consent service', async () => {
  const consentModule = await import('./buildConsentProvenance') as Record<string, unknown>
  const hasCheckoutIdentifierCaptureConsent = consentModule.hasCheckoutIdentifierCaptureConsent

  assert.equal(typeof hasCheckoutIdentifierCaptureConsent, 'function')
  const policy = hasCheckoutIdentifierCaptureConsent as CheckoutCapturePolicy

  for (const service of [
    'googleAnalytics',
    'googleAds',
    'meta',
    'microsoftAdvertising'
  ] as const) {
    const provenance = buildConsentProvenance(
      createCookiebotConsentState({
        statistics: service === 'googleAnalytics',
        marketing: service !== 'googleAnalytics'
      })
    )

    assert.equal(policy({
      ...provenance,
      services: {
        googleAnalytics: false,
        googleAds: false,
        meta: false,
        microsoftAdvertising: false,
        [service]: true
      }
    }), true, service)
  }
})

test('fails checkout capture closed without validated provider consent', async () => {
  const consentModule = await import('./buildConsentProvenance') as Record<string, unknown>
  const policy = consentModule.hasCheckoutIdentifierCaptureConsent as CheckoutCapturePolicy
  const provenance = buildConsentProvenance(createCookiebotConsentState())

  assert.equal(typeof policy, 'function')
  assert.equal(policy(provenance), false)
})
