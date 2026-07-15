import assert from 'node:assert/strict'
import test from 'node:test'
import { buildReportOnlyCsp } from './buildReportOnlyCsp'

test('protects structural directives and permits the consent-aware tag gateways', () => {
  const csp = buildReportOnlyCsp()

  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /base-uri 'self'/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.match(csp, /connect-src[^;]*https:\/\/js\.klarna\.com/)
  assert.match(csp, /script-src[^;]*https:\/\/js\.klarna\.com/)
  assert.match(csp, /report-uri \/api\/security\/csp-report/)
  assert.match(csp, /script-src[^;]*https:\/\/consent\.cookiebot\.com/)
  assert.match(csp, /script-src[^;]*https:\/\/consent\.cookiebot\.eu/)
  assert.match(csp, /script-src[^;]*https:\/\/www\.googletagmanager\.com/)
  assert.match(csp, /connect-src[^;]*https:\/\/cloud\.server\.utekos\.no/)
  assert.match(csp, /connect-src[^;]*https:\/\/pagead2\.googlesyndication\.com/)
  assert.doesNotMatch(csp, /posthog/)
  assert.doesNotMatch(csp, /facebook/)
  assert.doesNotMatch(csp, /nonce-/)
})
