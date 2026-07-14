import assert from 'node:assert/strict'
import test from 'node:test'
import { getProvidersForAcceptedTrackingEvent } from './getProvidersForAcceptedTrackingEvent'
import type { MetaEventPayload } from 'types/tracking/meta'

function createPayload(
  canonicalEventName: NonNullable<MetaEventPayload['canonicalEventName']>,
  eventName: NonNullable<MetaEventPayload['eventName']>
): MetaEventPayload {
  return {
    schemaVersion: 1,
    classification: 'marketing',
    source: 'browser',
    occurredAt: new Date().toISOString(),
    canonicalEventName,
    eventName,
    eventId: `${canonicalEventName}-event`,
    eventSourceUrl: 'https://utekos.no/produkter/test',
    actionSource: 'website',
    userData: undefined,
    ga4Data: {
      client_id: '123.456',
      session_id: '789'
    }
  }
}

test('never queues Google server retry rows for browser events', () => {
  for (const [canonicalEventName, eventName] of [
    ['select_item', 'SelectItem'],
    ['add_to_cart', 'AddToCart'],
    ['begin_checkout', 'InitiateCheckout']
  ] as const) {
    assert.deepEqual(
      getProvidersForAcceptedTrackingEvent(
        createPayload(canonicalEventName, eventName),
        { meta: true, google: true }
      ),
      ['meta']
    )
  }
})

test('keeps Meta dispatch independent of GA4 browser identifiers', () => {
  assert.deepEqual(
    getProvidersForAcceptedTrackingEvent(
      {
        ...createPayload('add_to_cart', 'AddToCart'),
        ga4Data: undefined
      },
      { meta: true, google: true }
    ),
    ['meta']
  )
})

test('does not queue Google for browser page_view fallback', () => {
  assert.deepEqual(
    getProvidersForAcceptedTrackingEvent(
      createPayload('page_view', 'PageView'),
      { meta: false, google: true }
    ),
    []
  )
})
