import assert from 'node:assert/strict'
import test from 'node:test'
import { metaViewItemProviderAdapter } from './metaViewItemProviderAdapter'

test('classifies an abortable Meta transport timeout as retryable', () => {
  assert.equal(
    metaViewItemProviderAdapter.isRetryable({
      code: 'ETIMEDOUT',
      name: 'MetaConversionsApiTimeoutError'
    }),
    true
  )
})

test('classifies transient Meta and server responses as retryable', () => {
  assert.equal(
    metaViewItemProviderAdapter.isRetryable({
      response: { code: 2, is_transient: true },
      status: 503
    }),
    true
  )
})
