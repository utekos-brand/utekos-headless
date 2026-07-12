import assert from 'node:assert/strict'
import test from 'node:test'
import { dispatchTrackingEventWithDependencies } from './dispatchTrackingEvent'

test('routes a Meta-only pageview without Google, Microsoft or PostHog side effects', async () => {
  const calls: string[] = []

  await dispatchTrackingEventWithDependencies(
    {
      eventName: 'PageView',
      eventId: 'evt-pageview',
      destinations: ['meta']
    },
    {
      hasConsent: () => true,
      resolveGa4Data: async () => ({ client_id: 'must-not-leak' }),
      pushGoogle: () => calls.push('google'),
      sendMeta: () => calls.push('meta'),
      sendMicrosoft: () => calls.push('microsoft_uet'),
      capturePostHog: () => calls.push('posthog'),
      sendLedger: async payload => {
        calls.push('ledger')
        assert.equal(payload.ga4Data, undefined)
      },
      getMetaUserData: () => ({ external_id: 'meta-id' }),
      now: () => 1_700_000_000_000,
      getLocation: () => 'https://utekos.no/test'
    }
  )

  assert.deepEqual(calls, ['meta', 'ledger'])
})

test('requires an explicit destination before dispatching a browser integration', async () => {
  const calls: string[] = []

  await dispatchTrackingEventWithDependencies(
    {
      eventName: 'AddToCart',
      eventId: 'evt-cart',
      destinations: ['google', 'microsoft_uet', 'posthog']
    },
    {
      hasConsent: () => true,
      resolveGa4Data: async () => ({ client_id: '123.456' }),
      pushGoogle: () => calls.push('google'),
      sendMeta: () => calls.push('meta'),
      sendMicrosoft: () => calls.push('microsoft_uet'),
      capturePostHog: () => calls.push('posthog'),
      sendLedger: async () => {
        calls.push('ledger')
      },
      getMetaUserData: () => ({}),
      now: () => 1_700_000_000_000,
      getLocation: () => 'https://utekos.no/test'
    }
  )

  assert.deepEqual(calls, ['google', 'microsoft_uet', 'posthog', 'ledger'])
})
