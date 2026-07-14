import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { parseAndValidateEventPayload } from '@/lib/tracking/utils/parseAndValidateEventPayload'

for (const event of [
  { eventName: 'ViewCart', canonicalEventName: 'view_cart' },
  { eventName: 'RemoveFromCart', canonicalEventName: 'remove_from_cart' },
  { eventName: 'Search', canonicalEventName: 'search' }
] as const) {
  test(`tracking route accepts ${event.canonicalEventName}`, async () => {
    const validation = await parseAndValidateEventPayload(new NextRequest('https://utekos.no/api/tracking-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
    }))

    assert.equal(validation.success, true)
    if (validation.success) {
      assert.equal(validation.payload.eventName, event.eventName)
    }
  })
}

test('tracking route uses the validated payload boundary', async () => {
  const routeSource = await readFile(new URL('./route.ts', import.meta.url), 'utf8')
  assert.match(routeSource, /parseAndValidateEventPayload\(request\)/)
})
