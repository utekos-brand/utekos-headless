import { z } from 'zod'

import { getMerchantCenterConfig } from '../../src/lib/google/merchant-center/config'

const syncEnvSchema = z.object({
  MERCHANT_SYNC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  GOOGLE_MERCHANT_SYNC_SECRET: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  MERCHANT_SYNC_MODE: z.enum(['dry-run', 'live']).optional(),
  MERCHANT_SYNC_CONFIRM: z.string().optional()
})

function getCliValue(name: string) {
  const args = process.argv.slice(2)
  const equalsPrefix = `--${name}=`
  const equalsArg = args.find(arg => arg.startsWith(equalsPrefix))

  if (equalsArg) {
    return equalsArg.slice(equalsPrefix.length)
  }

  const nameIndex = args.indexOf(`--${name}`)

  if (nameIndex === -1) {
    return undefined
  }

  return args[nameIndex + 1]
}

function hasCliFlag(name: string) {
  return process.argv.slice(2).includes(`--${name}`)
}

function buildLiveSyncSchema(accountId: string) {
  return z.object({
    MERCHANT_SYNC_CONFIRM: z.literal(`SYNC_MERCHANT_${accountId}`)
  })
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function buildSyncUrl(baseUrl: string, live: boolean) {
  const url = new URL('/api/internal/google/merchant/sync', trimTrailingSlash(baseUrl))

  url.searchParams.set('dryRun', live ? '0' : '1')

  return url
}

async function parseSyncResponse(response: Response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return responseText
  }
}

async function main() {
  const config = getMerchantCenterConfig()
  const parsedEnv = syncEnvSchema.parse({
    MERCHANT_SYNC_BASE_URL: process.env.MERCHANT_SYNC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    GOOGLE_MERCHANT_SYNC_SECRET: process.env.GOOGLE_MERCHANT_SYNC_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    MERCHANT_SYNC_MODE: process.env.MERCHANT_SYNC_MODE,
    MERCHANT_SYNC_CONFIRM: process.env.MERCHANT_SYNC_CONFIRM
  })
  const live =
    hasCliFlag('live') || parsedEnv.MERCHANT_SYNC_MODE === 'live'
  const confirmation = parsedEnv.MERCHANT_SYNC_CONFIRM ?? getCliValue('confirm')
  const syncSecret = parsedEnv.GOOGLE_MERCHANT_SYNC_SECRET ?? parsedEnv.CRON_SECRET
  const baseUrl =
    getCliValue('base-url') ??
    parsedEnv.MERCHANT_SYNC_BASE_URL ??
    parsedEnv.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  if (live) {
    const parsedConfirmation = buildLiveSyncSchema(config.accountId).safeParse({
      MERCHANT_SYNC_CONFIRM: confirmation
    })

    if (!parsedConfirmation.success) {
      console.error(
        JSON.stringify(
          {
            ok: false,
            blocked: 'explicit_live_sync_confirmation_required',
            accountId: config.accountId,
            requiredEnv: {
              MERCHANT_SYNC_CONFIRM: `SYNC_MERCHANT_${config.accountId}`
            },
            examples: {
              dryRun: 'npm run merchant:sync',
              liveInlineEnv:
                `MERCHANT_SYNC_CONFIRM=SYNC_MERCHANT_${config.accountId} npm run merchant:sync -- --live`,
              liveCliArgs:
                `npm run merchant:sync -- --live --confirm=SYNC_MERCHANT_${config.accountId}`
            },
            validation: parsedConfirmation.error.format()
          },
          null,
          2
        )
      )
      process.exitCode = 1
      return
    }
  }

  if (!syncSecret) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          blocked: 'missing_sync_secret',
          accountId: config.accountId,
          requiredEnv: {
            GOOGLE_MERCHANT_SYNC_SECRET:
              'Preferred authorization secret for /api/internal/google/merchant/sync.',
            CRON_SECRET:
              'Fallback authorization secret accepted by the route.'
          }
        },
        null,
        2
      )
    )
    process.exitCode = 1
    return
  }

  const syncUrl = buildSyncUrl(baseUrl, live)

  try {
    const response = await fetch(syncUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${syncSecret}`
      },
      cache: 'no-store'
    })
    const responseBody = await parseSyncResponse(response)

    console.log(
      JSON.stringify(
        {
          ok: response.ok,
          mode: live ? 'live' : 'dry-run',
          accountId: config.accountId,
          url: syncUrl.toString(),
          status: response.status,
          response: responseBody
        },
        null,
        2
      )
    )

    if (!response.ok) {
      process.exitCode = 1
    }
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          accountId: config.accountId,
          mode: live ? 'live' : 'dry-run',
          url: syncUrl.toString(),
          error: error instanceof Error ? error.message : 'Unexpected sync trigger error'
        },
        null,
        2
      )
    )
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
