import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLeadRequestContextFromHeaders } from './buildLeadRequestContextFromHeaders'

test('uses Vercel request headers for lead IP, geolocation and user agent', () => {
  const requestContext = buildLeadRequestContextFromHeaders(
    new Headers({
      'user-agent': 'Codex lead verification',
      'x-forwarded-for': '198.51.100.17, 203.0.113.9',
      'x-real-ip': '192.0.2.44',
      'x-vercel-ip-city': 'Bergen%20sentrum',
      'x-vercel-ip-country': 'NO',
      'x-vercel-ip-country-region': '46',
      'x-vercel-ip-postal-code': '5003'
    })
  )

  assert.deepEqual(requestContext, {
    city: 'Bergen sentrum',
    clientIpAddress: '192.0.2.44',
    countryCode: 'NO',
    postalCode: '5003',
    regionCode: '46',
    userAgent: 'Codex lead verification'
  })
})

test('does not treat x-forwarded-for as the Vercel client IP', () => {
  const requestContext = buildLeadRequestContextFromHeaders(
    new Headers({
      'x-forwarded-for': '198.51.100.17, 203.0.113.9'
    })
  )

  assert.deepEqual(requestContext, {})
})
