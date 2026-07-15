import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalPageViewStoreInput } from './acceptCanonicalPageView'
import {
  createCanonicalPageViewStore,
  type CanonicalPageViewTransaction
} from './createCanonicalPageViewStore'

function input(): CanonicalPageViewStoreInput {
  return {
    event: {
      schema_version: 1,
      event_name: 'page_view',
      event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      page_view_id: 'e58460a4-5a60-450c-962a-7f22254c25dd',
      event_time: '2026-07-15T10:00:00.000Z',
      source: 'web',
      environment: 'test',
      page_url: 'https://utekos.no/',
      page_title: 'Utekos',
      consent: {
        analytics: 'granted',
        marketing: 'granted',
        preferences: 'denied',
        source: 'cookiebot',
        version: '1'
      }
    },
    dispatches: [
      {
        dispatch_mode: 'server_retry',
        event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
        provider: 'meta'
      },
      {
        dispatch_mode: 'server_retry',
        event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
        provider: 'microsoft_uet'
      }
    ]
  }
}

test('writes the ledger and every dispatch inside one transaction callback', async () => {
  const calls: string[] = []
  let transactions = 0
  const transaction: CanonicalPageViewTransaction = {
    insertLedger: async () => {
      calls.push('ledger')
      return true
    },
    insertDispatch: async dispatch => {
      calls.push(dispatch.provider)
    }
  }
  const store = createCanonicalPageViewStore(async work => {
    transactions += 1
    return work(transaction)
  })

  const result = await store.accept(input())

  assert.equal(result, 'inserted')
  assert.equal(transactions, 1)
  assert.deepEqual(calls, ['ledger', 'meta', 'microsoft_uet'])
})

test('returns duplicate without writing dispatches when the ledger conflicts', async () => {
  let dispatchWrites = 0
  const transaction: CanonicalPageViewTransaction = {
    insertLedger: async () => false,
    insertDispatch: async () => {
      dispatchWrites += 1
    }
  }
  const store = createCanonicalPageViewStore(work => work(transaction))

  const result = await store.accept(input())

  assert.equal(result, 'duplicate')
  assert.equal(dispatchWrites, 0)
})
