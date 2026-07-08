import assert from 'node:assert/strict'
import test from 'node:test'

import { getPostHogPageviewUrl } from './getPostHogPageviewUrl'

test('builds PostHog pageview URLs without query parameters or fragments', () => {
  const url = getPostHogPageviewUrl({
    origin: 'https://utekos.no',
    pathname: '/produkter/utekos-dun',
    search: '?email=kunde@example.com&token=secret&utm_campaign=summer',
    hash: '#checkout'
  })

  assert.equal(url, 'https://utekos.no/produkter/utekos-dun')
})
