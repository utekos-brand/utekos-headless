import assert from 'node:assert/strict'
import test, { afterEach, beforeEach, mock } from 'node:test'

import { resetMicrosoftAdsAccessTokenCacheForTests } from '@/lib/microsoft-ads/microsoftAdsAccessTokenCache'
import { resetMicrosoftUetCapiApiTokenCacheForTests } from '@/lib/microsoft-ads/microsoftUetCapiApiTokenCache'
import { resetMicrosoftAdsRefreshTokenStateForTests } from '@/lib/microsoft-ads/microsoftAdsRefreshTokenState'
import { resolveMicrosoftUetCapiApiToken } from './resolveMicrosoftUetCapiApiToken'

const oauthEnv = {
  NODE_ENV: 'test',
  MICROSOFT_ADS_DEVELOPER_TOKEN: 'dev-token',
  MICROSOFT_ADS_CLIENT_ID: 'client-id',
  MICROSOFT_ADS_CLIENT_SECRET: 'client-secret',
  MICROSOFT_ADS_REFRESH_TOKEN: 'refresh-token',
  MICROSOFT_ADS_CUSTOMER_ID: '12345',
  MICROSOFT_ADS_ACCOUNT_ID: '67890',
  MICROSOFT_UET_TAG_ID: '97247724'
} as unknown as NodeJS.ProcessEnv

function resetCaches(): void {
  resetMicrosoftAdsAccessTokenCacheForTests()
  resetMicrosoftUetCapiApiTokenCacheForTests()
  resetMicrosoftAdsRefreshTokenStateForTests()
}

beforeEach(() => {
  resetCaches()
})

afterEach(() => {
  mock.restoreAll()
  resetCaches()
})

test('resolveMicrosoftUetCapiApiToken refreshes OAuth and fetches UetTagAuthKey when OAuth env is complete', async () => {
  const fetchMock = mock.fn(async (input: string | URL) => {
    const url = String(input)

    if (url.includes('login.microsoftonline.com')) {
      return new Response(JSON.stringify({
        access_token: 'fresh-access-token',
        expires_in: 3600,
        refresh_token: 'rotated-refresh-token'
      }), { status: 200 })
    }

    if (url.includes('UetTagAuthKey/Query')) {
      return new Response(JSON.stringify({ UetTagAuthKey: 'fresh-uet-auth-key' }), { status: 200 })
    }

    throw new Error(`Unexpected fetch URL: ${url}`)
  })

  mock.method(globalThis, 'fetch', fetchMock)

  const result = await resolveMicrosoftUetCapiApiToken({ env: oauthEnv })

  assert.equal(result.source, 'oauth')
  assert.equal(result.apiToken, 'fresh-uet-auth-key')
  assert.equal(result.refreshTokenRotated, true)
  assert.equal(fetchMock.mock.calls.length, 2)
})

test('resolveMicrosoftUetCapiApiToken serves cached UetTagAuthKey without refetching OAuth', async () => {
  let oauthCalls = 0
  const fetchMock = mock.fn(async (input: string | URL) => {
    const url = String(input)

    if (url.includes('login.microsoftonline.com')) {
      oauthCalls += 1
      return new Response(JSON.stringify({
        access_token: 'fresh-access-token',
        expires_in: 3600
      }), { status: 200 })
    }

    if (url.includes('UetTagAuthKey/Query')) {
      return new Response(JSON.stringify({ UetTagAuthKey: 'cached-uet-auth-key' }), { status: 200 })
    }

    throw new Error(`Unexpected fetch URL: ${url}`)
  })

  mock.method(globalThis, 'fetch', fetchMock)

  const first = await resolveMicrosoftUetCapiApiToken({ env: oauthEnv })
  const second = await resolveMicrosoftUetCapiApiToken({ env: oauthEnv })

  assert.equal(first.apiToken, 'cached-uet-auth-key')
  assert.equal(second.apiToken, 'cached-uet-auth-key')
  assert.equal(oauthCalls, 1)
})

test('resolveMicrosoftUetCapiApiToken forceRefresh bypasses cache and refetches', async () => {
  let authKeyCalls = 0
  const fetchMock = mock.fn(async (input: string | URL) => {
    const url = String(input)

    if (url.includes('login.microsoftonline.com')) {
      return new Response(JSON.stringify({
        access_token: 'fresh-access-token',
        expires_in: 3600
      }), { status: 200 })
    }

    if (url.includes('UetTagAuthKey/Query')) {
      authKeyCalls += 1
      return new Response(JSON.stringify({ UetTagAuthKey: `uet-key-${authKeyCalls}` }), { status: 200 })
    }

    throw new Error(`Unexpected fetch URL: ${url}`)
  })

  mock.method(globalThis, 'fetch', fetchMock)

  const first = await resolveMicrosoftUetCapiApiToken({ env: oauthEnv })
  const refreshed = await resolveMicrosoftUetCapiApiToken({ forceRefresh: true, env: oauthEnv })

  assert.equal(first.apiToken, 'uet-key-1')
  assert.equal(refreshed.apiToken, 'uet-key-2')
  assert.equal(authKeyCalls, 2)
})

test('resolveMicrosoftUetCapiApiToken falls back to env token when OAuth refresh fails', async () => {
  const fetchMock = mock.fn(async () => new Response(JSON.stringify({
    error: 'invalid_grant'
  }), { status: 400 }))

  mock.method(globalThis, 'fetch', fetchMock)

  const result = await resolveMicrosoftUetCapiApiToken({
    env: {
      ...oauthEnv,
      MICROSOFT_UET_CAPI_ACCESS_TOKEN: 'env-fallback-token'
    }
  })

  assert.equal(result.source, 'env')
  assert.equal(result.apiToken, 'env-fallback-token')
})

test('resolveMicrosoftUetCapiApiToken uses env token when OAuth env is incomplete', async () => {
  const fetchMock = mock.fn(async () => {
    throw new Error('fetch should not be called without OAuth env')
  })

  mock.method(globalThis, 'fetch', fetchMock)

  const result = await resolveMicrosoftUetCapiApiToken({
    env: {
      NODE_ENV: 'test',
      MICROSOFT_UET_CAPI_ACCESS_TOKEN: 'env-only-token'
    } as unknown as NodeJS.ProcessEnv
  })

  assert.equal(result.source, 'env')
  assert.equal(result.apiToken, 'env-only-token')
  assert.equal(fetchMock.mock.calls.length, 0)
})
