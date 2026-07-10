import assert from 'node:assert/strict'
import test from 'node:test'

import { isIgnorableClientError } from './isIgnorableClientError'

test('ignores errors whose script source is a Chrome extension', () => {
  assert.equal(
    isIgnorableClientError({
      message: 'Uncaught DataCloneError: Failed to execute \'postMessage\' on \'Window\'',
      source: 'chrome-extension://dmbjdmncfodongiidmmonmkomhijolad/src/setup.js',
      stack: 'at chrome-extension://dmbjdmncfodongiidmmonmkomhijolad/src/setup.js:27:10'
    }),
    true
  )
})

test('keeps first-party and Clarity errors actionable', () => {
  assert.equal(
    isIgnorableClientError({
      message: 'Uncaught DataCloneError: Failed to execute \'postMessage\' on \'Window\'',
      source: 'https://utekos.no/_next/static/chunks/app.js',
      stack: 'at https://scripts.clarity.ms/0.8.67/clarity.js:2:31578'
    }),
    false
  )
})

test('keeps first-party errors when an extension appears only deeper in the stack', () => {
  assert.equal(
    isIgnorableClientError({
      message: 'First-party failure',
      source: 'https://utekos.no/_next/static/chunks/app.js',
      stack: [
        'at https://utekos.no/_next/static/chunks/app.js:1:1',
        'at chrome-extension://example/content.js:1:1'
      ].join('\n')
    }),
    false
  )
})

test('retains the existing in-app WebView noise filters', () => {
  assert.equal(
    isIgnorableClientError({
      message: 'window.webkit.messageHandlers.sendDataToNative is undefined'
    }),
    true
  )
})
