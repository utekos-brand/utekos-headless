import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getMicrosoftUetCapiTokenEnvPresence,
  MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS,
  resolveMicrosoftUetCapiTokenFromEnv
} from './microsoftUetCapiTokenEnvKeys'

function withEnv(
  overrides: Record<string, string | undefined>,
  run: () => void | Promise<void>
): void | Promise<void> {
  const previous = Object.fromEntries(
    MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS.map(key => [key, process.env[key]])
  )

  for (const key of MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS) {
    delete process.env[key]
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  return Promise.resolve(run()).finally(() => {
    for (const key of MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS) {
      const value = previous[key]

      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  })
}

test('resolveMicrosoftUetCapiTokenFromEnv prefers MICROSOFT_UET_CAPI_ACCESS_TOKEN alias', () =>
  withEnv(
    {
      MICROSOFT_UET_CAPI_ACCESS_TOKEN: 'access-alias-token',
      MICROSOFT_UET_CAPI_TOKEN: 'legacy-token'
    },
    () => {
      assert.equal(resolveMicrosoftUetCapiTokenFromEnv(), 'access-alias-token')
    }
  ))

test('resolveMicrosoftUetCapiTokenFromEnv falls back through canonical UET CAPI env keys', () =>
  withEnv(
    {
      MICROSOFT_ADS_UET_CAPI_TOKEN: 'ads-uet-token'
    },
    () => {
      assert.equal(resolveMicrosoftUetCapiTokenFromEnv(), 'ads-uet-token')
    }
  ))

test('getMicrosoftUetCapiTokenEnvPresence does not treat MICROSOFT_ADS_ACCESS_TOKEN as UET CAPI', () => {
  const presence = getMicrosoftUetCapiTokenEnvPresence({
    MICROSOFT_ADS_ACCESS_TOKEN: 'oauth-token',
    MICROSOFT_UET_CAPI_TOKEN: 'uet-token'
  } as unknown as NodeJS.ProcessEnv)

  assert.equal(presence.MICROSOFT_UET_CAPI_TOKEN, true)
  assert.equal(presence.MICROSOFT_UET_CAPI_ACCESS_TOKEN, false)
})
