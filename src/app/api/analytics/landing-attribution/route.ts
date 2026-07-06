// Path: src/app/api/analytics/landing-attribution/route.ts

import { after, type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hasRequestMarketingConsent } from '@/lib/tracking/consent/hasRequestMarketingConsent'
import { persistLandingAttribution } from '@/lib/tracking/warehouse/persistLandingAttribution'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'

const landingAttributionSchema = z.object({
  anonymousId: z.string().trim().min(1).max(160).optional().nullable(),
  landingPath: z.string().trim().min(1).max(2048).optional().nullable(),
  referrer: z.string().trim().max(2048).optional().nullable(),
  utm_source: z.string().trim().max(255).optional().nullable(),
  utm_medium: z.string().trim().max(255).optional().nullable(),
  utm_campaign: z.string().trim().max(255).optional().nullable(),
  utm_content: z.string().trim().max(255).optional().nullable(),
  utm_term: z.string().trim().max(255).optional().nullable(),
  fbclid: z.string().trim().max(512).optional().nullable(),
  ad_id: z.string().trim().max(128).optional().nullable(),
  adset_id: z.string().trim().max(128).optional().nullable(),
  campaign_id: z.string().trim().max(128).optional().nullable()
})

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate'
} as const

export async function POST(request: NextRequest) {
  if (!hasRequestMarketingConsent(request)) {
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS })
  }

  let parsed: z.infer<typeof landingAttributionSchema>

  try {
    parsed = landingAttributionSchema.parse(await request.json())
  } catch {
    return NextResponse.json(
      { error: 'Invalid landing attribution payload' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const userAgent = request.headers.get('user-agent')

  after(async () => {
    try {
      await persistLandingAttribution({
        anonymousId: parsed.anonymousId ?? null,
        source: parsed.utm_source ?? (parsed.fbclid ? 'meta' : null),
        medium: parsed.utm_medium ?? null,
        campaign: parsed.utm_campaign ?? null,
        content: parsed.utm_content ?? null,
        term: parsed.utm_term ?? null,
        landingPath: parsed.landingPath ?? null,
        referrer: parsed.referrer ?? null,
        userAgent,
        metadata: {
          fbclid: parsed.fbclid ?? null,
          adId: parsed.ad_id ?? null,
          adsetId: parsed.adset_id ?? null,
          campaignId: parsed.campaign_id ?? null
        }
      })
    } catch (error) {
      await logToAppLogs('ERROR', 'Landing attribution persistence failed', {
        landingPath: parsed.landingPath,
        error: error instanceof Error ? error.message : 'Unknown database error'
      })
    }
  })

  return new NextResponse(null, { status: 202, headers: NO_STORE_HEADERS })
}
