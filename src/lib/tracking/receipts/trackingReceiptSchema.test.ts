import assert from 'node:assert/strict'
import test from 'node:test'
import {
  internalTaggingObservationSchema,
  trackingReceiptSchema
} from './trackingReceiptSchema'

test('accepts only PII-free receipt fields', () => {
  const valid = trackingReceiptSchema.safeParse({
    idempotencyKey: 'evt_123:tag_execution:4',
    eventId: 'evt_123',
    eventName: 'add_to_cart',
    observationType: 'tag_execution',
    containerId: 'GTM-TEST',
    containerVersion: '23',
    clientName: 'GA4',
    tagId: '4',
    tagStatus: 'success',
    tagExecutionTimeMs: 12,
    observedAt: '2026-07-12T12:00:00.000Z'
  })
  const withUrl = trackingReceiptSchema.safeParse({
    ...(valid.success ? valid.data : {}),
    url: 'https://utekos.no/private?email=test@example.com'
  })

  assert.equal(valid.success, true)
  assert.equal(withUrl.success, false)
})

test('rejects browser dispatches on the public signed receipt contract', () => {
  const publicReceipt = trackingReceiptSchema.safeParse({
    idempotencyKey: 'browser_dispatch:evt_123',
    eventId: 'evt_123',
    eventName: 'add_to_cart',
    observationType: 'browser_dispatch',
    observedAt: '2026-07-12T12:00:00.000Z'
  })
  const internalObservation = internalTaggingObservationSchema.safeParse({
    idempotencyKey: 'browser_dispatch:evt_123',
    eventId: 'evt_123',
    eventName: 'add_to_cart',
    observationType: 'browser_dispatch',
    observedAt: '2026-07-12T12:00:00.000Z'
  })

  assert.equal(publicReceipt.success, false)
  assert.equal(internalObservation.success, true)
})

test('requires tag metadata only for tag execution receipts', () => {
  const missingTagMetadata = trackingReceiptSchema.safeParse({
    idempotencyKey: 'evt_123:tag_execution:4',
    eventId: 'evt_123',
    eventName: 'add_to_cart',
    observationType: 'tag_execution',
    containerId: 'GTM-TEST',
    containerVersion: '23',
    clientName: 'GA4',
    observedAt: '2026-07-12T12:00:00.000Z'
  })
  const ingressWithTagMetadata = trackingReceiptSchema.safeParse({
    idempotencyKey: 'evt_123:sgtm_ingress',
    eventId: 'evt_123',
    eventName: 'add_to_cart',
    observationType: 'sgtm_ingress',
    containerId: 'GTM-TEST',
    containerVersion: '23',
    clientName: 'GA4',
    tagId: '4',
    tagStatus: 'success',
    observedAt: '2026-07-12T12:00:00.000Z'
  })

  assert.equal(missingTagMetadata.success, false)
  assert.equal(ingressWithTagMetadata.success, false)
})
