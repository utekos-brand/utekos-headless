import assert from 'node:assert/strict'
import test from 'node:test'

import { deadLetterEventMetadataSchema } from './deadLetterEventMetadataSchema'
import { parseDeadLetterProvider } from './parseDeadLetterProvider'

test('parseDeadLetterProvider accepts meta, google and microsoft_uet tracking sources', () => {
  assert.equal(parseDeadLetterProvider('tracking:meta'), 'meta')
  assert.equal(parseDeadLetterProvider('tracking:google'), 'google')
  assert.equal(parseDeadLetterProvider('tracking:microsoft_uet'), 'microsoft_uet')
})

test('parseDeadLetterProvider rejects unsupported tracking sources', () => {
  assert.equal(parseDeadLetterProvider('tracking:posthog'), null)
  assert.equal(parseDeadLetterProvider('shopify:order'), null)
  assert.equal(parseDeadLetterProvider('tracking:'), null)
})

test('deadLetterEventMetadataSchema requires provider dispatch attempt id', () => {
  const parsed = deadLetterEventMetadataSchema.safeParse({
    providerDispatchAttemptId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    eventId: 'purchase_123',
    eventName: 'Purchase',
    attemptCount: 5
  })

  assert.equal(parsed.success, true)
})

test('deadLetterEventMetadataSchema rejects missing provider dispatch attempt id', () => {
  const parsed = deadLetterEventMetadataSchema.safeParse({
    eventId: 'purchase_123'
  })

  assert.equal(parsed.success, false)
})
