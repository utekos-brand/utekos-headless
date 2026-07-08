import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCookiebotConsentState } from './createCookiebotConsentState'
import {
  parseCookiebotConsentCookie,
  parseCookiebotConsentCookieValue
} from './parseCookiebotConsentCookie'
import {
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_POSTHOG_SERVICE_NAME
} from './cookiebotConfig'

test('parseCookiebotConsentCookieValue reads encoded Cookiebot object values', () => {
  const value = encodeURIComponent(
    "{stamp:'abc',necessary:true,preferences:false,statistics:true,marketing:false,method:'explicit'}"
  )

  assert.deepEqual(parseCookiebotConsentCookieValue(value), {
    preferences: false,
    statistics: true,
    marketing: false
  })
})

test('parseCookiebotConsentCookieValue treats Cookiebot -1 as full consent', () => {
  assert.deepEqual(parseCookiebotConsentCookieValue('-1'), {
    preferences: true,
    statistics: true,
    marketing: true
  })
})

test('parseCookiebotConsentCookie reads CookieConsent from request cookie header', () => {
  const value = encodeURIComponent(
    "{necessary:true,preferences:true,statistics:false,marketing:true}"
  )

  assert.deepEqual(parseCookiebotConsentCookie(`foo=bar; CookieConsent=${value}`), {
    preferences: true,
    statistics: false,
    marketing: true
  })
})

test('createCookiebotConsentState maps categories to provider service gates', () => {
  const consent = createCookiebotConsentState({
    preferences: false,
    statistics: true,
    marketing: true
  })

  assert.equal(consent.source, 'cookiebot')
  assert.equal(consent.services[COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME], true)
  assert.equal(consent.services[COOKIEBOT_POSTHOG_SERVICE_NAME], true)
  assert.equal(consent.services[COOKIEBOT_META_SERVICE_NAME], true)
})
