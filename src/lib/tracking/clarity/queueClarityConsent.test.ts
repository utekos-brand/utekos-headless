import assert from 'node:assert/strict'
import test from 'node:test'
import { queueClarityConsent } from './queueClarityConsent'

test('queues consentv2 before the Clarity loader exists', () => {
  const windowMock: Record<string, unknown> = {}
  Object.defineProperty(globalThis, 'window', { value: windowMock, configurable: true })

  queueClarityConsent({
    source: 'cookiebot',
    ad_Storage: 'denied',
    analytics_Storage: 'granted'
  })

  const clarity = windowMock.clarity as { q?: unknown[][] }
  assert.deepEqual(clarity.q, [[
    'consentv2',
    {
      source: 'cookiebot',
      ad_Storage: 'denied',
      analytics_Storage: 'granted'
    }
  ]])

  Reflect.deleteProperty(globalThis, 'window')
})
