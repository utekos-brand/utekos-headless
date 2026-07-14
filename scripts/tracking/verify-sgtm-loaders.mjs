#!/usr/bin/env node

import process from 'node:process'
import { z } from 'zod/v4'

const configSchema = z.object({
  origin: z.url(),
  gtmId: z.string().regex(/^GTM-[A-Z0-9]+$/),
  canonicalGoogleTagId: z.string().regex(/^GT-[A-Z0-9]+$/),
  secondaryGoogleTagId: z.string().regex(/^GT-[A-Z0-9]+$/),
  googleAdsId: z.string().regex(/^AW-[A-Z0-9]+$/)
})

const config = configSchema.parse({
  origin: process.env.NEXT_PUBLIC_TRACKING_SGTM_ORIGIN || 'https://cloud.server.utekos.no',
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_GTM_ID || 'GTM-5TWMJQFP',
  canonicalGoogleTagId: process.env.CANONICAL_GOOGLE_TAG_ID || 'GT-MKRLF5WK',
  secondaryGoogleTagId: process.env.SECONDARY_GOOGLE_TAG_ID || 'GT-P3JGLNDZ',
  googleAdsId: process.env.GOOGLE_ADS_TAG_ID || 'AW-18180376403'
})

const endpointDefinitions = [
  { label: 'sGTM health', path: '/healthy', contentType: /^text\/plain\b/ },
  { label: 'Cookiebot consent signals', path: '/uc-consent-signals.js', contentType: /^application\/javascript\b/ },
  { label: 'GTM web container loader', path: `/gtm.js?id=${encodeURIComponent(config.gtmId)}`, contentType: /^application\/javascript\b/ },
  { label: 'GTM noscript iframe', path: `/ns.html?id=${encodeURIComponent(config.gtmId)}`, contentType: /^text\/html\b/ },
  { label: 'Canonical Google tag loader', path: `/gtag/js?id=${encodeURIComponent(config.canonicalGoogleTagId)}`, contentType: /^application\/javascript\b/ },
  { label: 'Secondary Google tag loader', path: `/gtag/js?id=${encodeURIComponent(config.secondaryGoogleTagId)}`, contentType: /^application\/javascript\b/ },
  { label: 'Google Ads loader', path: `/gtag/js?id=${encodeURIComponent(config.googleAdsId)}`, contentType: /^application\/javascript\b/ }
]

async function probeEndpoint(definition) {
  const url = new URL(definition.path, config.origin)

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000)
    })
    const body = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || ''
    const ok = response.status === 200 && body.byteLength > 0 && definition.contentType.test(contentType)

    return {
      label: definition.label,
      url: url.toString(),
      ok,
      status: response.status,
      content_type: contentType,
      bytes: body.byteLength
    }
  } catch (error) {
    return {
      label: definition.label,
      url: url.toString(),
      ok: false,
      status: null,
      content_type: null,
      bytes: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

const results = await Promise.all(endpointDefinitions.map(probeEndpoint))
const failures = results.filter(result => !result.ok)

console.log(JSON.stringify({
  checked_at: new Date().toISOString(),
  origin: config.origin,
  ok: failures.length === 0,
  endpoints: results
}, null, 2))

if (failures.length > 0) {
  process.exit(1)
}
