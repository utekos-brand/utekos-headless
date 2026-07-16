import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalViewItem } from '../viewItemEvent'
import type { MetaViewItemAttemptOutcome } from './processMetaViewItemAttempt'
import {
  createMetaViewItemOutboxStore,
  type MetaViewItemOutboxDatabase,
  type RawMetaViewItemAttempt
} from './createMetaViewItemOutboxStore'

function viewItem(): CanonicalViewItem {
  return {
    schema_version: 1,
    event_name: 'view_item',
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    page_view_id: 'a59e9b92-cb07-4e2c-b384-62bfdd519e13',
    event_time: '2026-07-16T10:00:00.000Z',
    source: 'web',
    environment: 'test',
    page_url: 'https://utekos.no/produkter/utekos-techdown',
    page_title: 'Utekos TechDown™',
    consent: {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    },
    custom_data: {
      currency: 'NOK',
      value: 1592,
      gross_value: 1990,
      tax_value: 398,
      items: [
        {
          item_id: '48249962135800',
          product_id: 'gid://shopify/Product/9123456789012',
          variant_id:
            'gid://shopify/ProductVariant/48249962135800',
          item_name: 'Utekos TechDown™',
          item_brand: 'Utekos',
          item_variant: 'M / Sort',
          item_category: 'Poncho',
          product_handle: 'utekos-techdown',
          product_type: 'Yttertøy',
          sku: 'UTEKOS-TD-M-BLK',
          quantity: 1,
          unit_price: 1592,
          gross_unit_price: 1990,
          tax_amount: 398,
          tax_rate: 0.25,
          taxable: true,
          price_includes_tax: true,
          available_for_sale: true,
          currently_not_in_stock: false,
          quantity_available: 12,
          selected_options: [
            { name: 'Størrelse', value: 'M' },
            { name: 'Farge', value: 'Sort' }
          ],
          collection_ids: ['gid://shopify/Collection/123456789'],
          collection_titles: ['Ponchoer']
        }
      ]
    }
  }
}

function rawAttempt(
  payload: unknown = viewItem()
): RawMetaViewItemAttempt {
  return {
    attemptCount: 1,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    payload
  }
}

function succeededOutcome(): MetaViewItemAttemptOutcome {
  return {
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    latencyMs: 125,
    receipt: {
      eventId: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      eventName: 'view_item',
      provider: 'meta',
      result: {
        eventsReceived: 1,
        fbTraceId: 'meta-trace-1',
        messages: [],
        processedEntries: 1
      }
    },
    status: 'succeeded'
  }
}

function fakeDatabase(attempts: RawMetaViewItemAttempt[]): {
  accepted: MetaViewItemAttemptOutcome[]
  database: MetaViewItemOutboxDatabase
  deadLettered: MetaViewItemAttemptOutcome[]
  invalid: Array<{ attemptId: string; errorMessage: string }>
  retries: MetaViewItemAttemptOutcome[]
} {
  const queue = [...attempts]
  const accepted: MetaViewItemAttemptOutcome[] = []
  const deadLettered: MetaViewItemAttemptOutcome[] = []
  const invalid: Array<{
    attemptId: string
    errorMessage: string
  }> = []
  const retries: MetaViewItemAttemptOutcome[] = []

  return {
    accepted,
    deadLettered,
    invalid,
    retries,
    database: {
      claimNext: async () => queue.shift() ?? null,
      markAcceptedUnverified: async outcome => {
        accepted.push(outcome)
      },
      markDeadLettered: async outcome => {
        deadLettered.push(outcome)
      },
      markInvalidPayload: async failure => {
        invalid.push(failure)
      },
      markRetryScheduled: async outcome => {
        retries.push(outcome)
      }
    }
  }
}

test('dead-letters an invalid payload and continues to the next row', async () => {
  const first = rawAttempt({ event_name: 'view_item' })
  const second = rawAttempt()
  const fake = fakeDatabase([first, second])
  const store = createMetaViewItemOutboxStore(fake.database)

  const claimed = await store.claimNext()

  assert.equal(fake.invalid.length, 1)
  assert.equal(fake.invalid[0]?.attemptId, first.attemptId)
  assert.match(
    fake.invalid[0]?.errorMessage ?? '',
    /^Invalid canonical view_item payload:/
  )
  assert.deepEqual(claimed, {
    attemptCount: second.attemptCount,
    attemptId: second.attemptId,
    event: viewItem()
  })
})

test('persists provider acceptance as accepted_unverified', async () => {
  const fake = fakeDatabase([])
  const store = createMetaViewItemOutboxStore(fake.database)
  const outcome = succeededOutcome()

  await store.complete(outcome)

  assert.deepEqual(fake.accepted, [outcome])
})

test('persists a scheduled retry', async () => {
  const fake = fakeDatabase([])
  const store = createMetaViewItemOutboxStore(fake.database)
  const outcome: MetaViewItemAttemptOutcome = {
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    errorMessage: 'FacebookRequestError: unavailable',
    latencyMs: 125,
    nextAttemptAt: '2026-07-16T10:01:00.125Z',
    status: 'retry_scheduled'
  }

  await store.complete(outcome)

  assert.deepEqual(fake.retries, [outcome])
})

test('persists a terminal failure as dead_lettered', async () => {
  const fake = fakeDatabase([])
  const store = createMetaViewItemOutboxStore(fake.database)
  const outcome: MetaViewItemAttemptOutcome = {
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    errorMessage: 'FacebookRequestError: invalid parameter',
    latencyMs: 125,
    reason: 'permanent_error',
    status: 'dead_lettered'
  }

  await store.complete(outcome)

  assert.deepEqual(fake.deadLettered, [outcome])
})
