import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalPageView } from '../pageViewEvent'
import { planCanonicalPageViewDispatch } from './planCanonicalPageViewDispatch'

function pageView(marketing: 'denied' | 'granted'): CanonicalPageView {
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
      analytics: 'granted',
      marketing,
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    }
  }
}

test('does not queue advertising providers without marketing consent', () => {
  assert.deepEqual(planCanonicalPageViewDispatch(pageView('denied')), [])
})

test('keeps the legacy alias fail-closed for page_view server rows', () => {
  assert.deepEqual(planCanonicalPageViewDispatch(pageView('granted')), [])
})
