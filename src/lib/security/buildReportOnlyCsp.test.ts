import assert from 'node:assert/strict'
import test from 'node:test'
import { buildReportOnlyCsp } from './buildReportOnlyCsp'

test('protects structural directives and explicitly permits the sGTM origin', () => {
  const csp = buildReportOnlyCsp()

  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /base-uri 'self'/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.match(csp, /connect-src[^;]*https:\/\/cloud\.server\.utekos\.no/)
  assert.match(csp, /img-src[^;]*https:\/\/cloud\.server\.utekos\.no/)
  assert.match(csp, /frame-src[^;]*https:\/\/cloud\.server\.utekos\.no/)
  assert.match(csp, /connect-src[^;]*https:\/\/portal\.utekos\.no/)
  assert.match(csp, /script-src[^;]*https:\/\/connect\.facebook\.net/)
  assert.match(csp, /script-src[^;]*https:\/\/bat\.bing\.com/)
  assert.match(csp, /script-src[^;]*https:\/\/scripts\.clarity\.ms/)
  const activeGtmLoader = new URL('https://cloud.server.utekos.no/gtm.js?id=GTM-5TWMJQFP')
  const scriptSources = csp.split('; ').find(directive => directive.startsWith('script-src '))?.split(' ') || []
  assert.ok(scriptSources.includes(activeGtmLoader.origin), 'active first-party /gtm.js origin must be allowed')
  assert.match(csp, /report-uri \/api\/security\/csp-report/)
  assert.doesNotMatch(csp, /nonce-/)
})
