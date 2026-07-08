import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldEnqueueMicrosoftUetRetry } from './shouldEnqueueMicrosoftUetRetry'

const attribution = {
  cartId: 'cart_1',
  checkoutUrl: 'https://utekos.no/checkout',
  userData: { msclkid: 'msclkid_1' },
  ts: 1_700_000_000_000,
  msclkid: 'msclkid_1'
}

test('shouldEnqueueMicrosoftUetRetry returns true for retryable Microsoft UET API failures', () => {
  assert.equal(
    shouldEnqueueMicrosoftUetRetry(
      {
        success: false,
        reason: 'microsoft_uet_error',
        tagId: 'tag_1',
        error: 'upstream unavailable'
      },
      { status: 'fulfilled', value: undefined },
      attribution
    ),
    true
  )
})

test('shouldEnqueueMicrosoftUetRetry returns false for qualified skips', () => {
  assert.equal(
    shouldEnqueueMicrosoftUetRetry(
      {
        success: false,
        skipped: true,
        reason: 'missing_msclkid',
        tagId: 'tag_1'
      },
      { status: 'fulfilled', value: undefined },
      attribution
    ),
    false
  )
})

test('shouldEnqueueMicrosoftUetRetry returns false without attribution', () => {
  assert.equal(
    shouldEnqueueMicrosoftUetRetry(
      {
        success: false,
        reason: 'network_error',
        tagId: 'tag_1',
        error: 'timeout'
      },
      { status: 'fulfilled', value: undefined },
      null
    ),
    false
  )
})
