import assert from 'node:assert/strict'
import test from 'node:test'
import { trackingEventPayloadSchema } from './trackingEventPayloadSchema'

for (const event of [
  { eventName: 'ViewCart', canonicalEventName: 'view_cart' },
  { eventName: 'RemoveFromCart', canonicalEventName: 'remove_from_cart' },
  { eventName: 'Search', canonicalEventName: 'search' }
] as const) {
  test(`accepts ${event.canonicalEventName} browser payloads`, () => {
    const result = trackingEventPayloadSchema.safeParse({
      schemaVersion: 1,
      classification: 'statistics',
      source: 'browser',
      occurredAt: '2026-07-13T10:00:00.000Z',
      eventName: event.eventName,
      canonicalEventName: event.canonicalEventName,
      eventId: `evt-${event.canonicalEventName}`,
      eventSourceUrl: 'https://utekos.no/produkter',
      actionSource: 'website',
      eventData: {}
    })

    assert.equal(result.success, true)
  })
}
