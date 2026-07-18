import assert from 'node:assert/strict'
import test from 'node:test'
import {
  acceptCanonicalPageView,
  type CanonicalPageViewStore
} from './acceptCanonicalPageView'

function pageView(
  analytics: 'denied' | 'granted',
  marketing: 'denied' | 'granted'
) {
  return {
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
      analytics,
      marketing,
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    }
  }
}

test('rejects fully denied events without calling storage', async () => {
  let calls = 0
  const store: CanonicalPageViewStore = {
    accept: async () => {
      calls += 1
      return 'inserted'
    }
  }

  const result = await acceptCanonicalPageView({
    payload: pageView('denied', 'denied'),
    requestContext: {},
    store
  })

  assert.deepEqual(result, {
    reason: 'consent_denied',
    status: 'rejected'
  })
  assert.equal(calls, 0)
})

test('accepts the event and its provider intents through one storage call', async () => {
  const writes: Parameters<
    CanonicalPageViewStore['accept']
  >[0][] = []
  const store: CanonicalPageViewStore = {
    accept: async input => {
      writes.push(input)
      return 'inserted'
    }
  }

  const result = await acceptCanonicalPageView({
    payload: pageView('granted', 'granted'),
    requestContext: {},
    store
  })

  assert.equal(result.status, 'accepted')
  assert.equal(writes.length, 1)
  assert.deepEqual(
    writes[0]?.dispatches.map(dispatch => dispatch.provider),
    ['meta']
  )
})

test('reports an idempotent duplicate returned by storage', async () => {
  const store: CanonicalPageViewStore = {
    accept: async () => 'duplicate'
  }

  const result = await acceptCanonicalPageView({
    payload: pageView('granted', 'denied'),
    requestContext: {},
    store
  })

  assert.deepEqual(result, {
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    status: 'duplicate'
  })
})
