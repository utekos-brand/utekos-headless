import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalEventEnvelopeSchema } from './canonicalEventEnvelope'

const envelope = {
  schema_version: 1 as const,
  event_name: 'page_view',
  event_id: 'd8b18b30-9ce4-4a55-b40f-ffbc3bda9aa7',
  event_time: '2026-07-15T12:34:56.789Z',
  source: 'web' as const,
  environment: 'test' as const,
  consent: {
    analytics: 'denied' as const,
    marketing: 'denied' as const,
    preferences: 'denied' as const,
    source: 'cookiebot' as const,
    version: '1'
  }
}

test('parses the shared canonical event envelope', () => {
  assert.deepEqual(
    canonicalEventEnvelopeSchema.parse(envelope),
    envelope
  )
})

test('supports browser, server, and webhook ownership without requiring a page URL', () => {
  for (const source of ['web', 'server', 'webhook'] as const) {
    const parsed = canonicalEventEnvelopeSchema.parse({
      ...envelope,
      source
    })

    assert.equal(parsed.source, source)
    assert.equal(parsed.page_url, undefined)
  }
})

test('rejects unknown canonical event envelope fields', () => {
  assert.throws(
    () =>
      canonicalEventEnvelopeSchema.parse({
        ...envelope,
        provider_payload: {}
      }),
    /Unrecognized key/
  )
})
