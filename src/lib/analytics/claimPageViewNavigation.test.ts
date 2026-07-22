import assert from 'node:assert/strict'
import test from 'node:test'
import {
  claimPageViewNavigation,
  resetClaimedPageViewNavigationForTests
} from './claimPageViewNavigation'

test('claims the first page once and ignores remount with the same URL', () => {
  resetClaimedPageViewNavigationForTests()

  const first = claimPageViewNavigation({
    currentUrl: 'https://utekos.no/',
    documentReferrer: 'https://www.google.com/'
  })
  const remount = claimPageViewNavigation({
    currentUrl: 'https://utekos.no/',
    documentReferrer: 'https://www.google.com/'
  })

  assert.equal(first?.pageUrl, 'https://utekos.no/')
  assert.equal(first?.referrerUrl, 'https://www.google.com/')
  assert.equal(remount, null)
})

test('claims SPA navigation once even when previousUrl would have been null', () => {
  resetClaimedPageViewNavigationForTests()

  assert.ok(
    claimPageViewNavigation({
      currentUrl: 'https://utekos.no/',
      documentReferrer: ''
    })
  )

  const navigation = claimPageViewNavigation({
    currentUrl: 'https://utekos.no/kundeservice',
    documentReferrer: 'https://www.google.com/'
  })
  const remountAfterSpa = claimPageViewNavigation({
    currentUrl: 'https://utekos.no/kundeservice',
    documentReferrer: 'https://www.google.com/'
  })

  assert.equal(navigation?.pageUrl, 'https://utekos.no/kundeservice')
  assert.equal(navigation?.referrerUrl, 'https://utekos.no/')
  assert.equal(remountAfterSpa, null)
})

test('ignores query-only changes on the same page resource', () => {
  resetClaimedPageViewNavigationForTests()

  assert.ok(
    claimPageViewNavigation({
      currentUrl: 'https://utekos.no/produkter',
      documentReferrer: ''
    })
  )

  assert.equal(
    claimPageViewNavigation({
      currentUrl: 'https://utekos.no/produkter?sort=price',
      documentReferrer: ''
    }),
    null
  )
})
