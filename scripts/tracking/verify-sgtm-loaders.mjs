#!/usr/bin/env node

import process from 'node:process'
import { z } from 'zod/v4'

const config = z.object({
  origin: z.url(),
  gtmId: z.string().regex(/^GTM-[A-Z0-9]+$/),
  canonicalGoogleTagId: z.string().regex(/^GT-[A-Z0-9]+$/)
}).parse({
  origin: process.env.NEXT_PUBLIC_TRACKING_SGTM_ORIGIN || 'https://cloud.server.utekos.no',
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_GTM_ID || 'GTM-5TWMJQFP',
  canonicalGoogleTagId: process.env.CANONICAL_GOOGLE_TAG_ID || 'GT-MKRLF5WK'
})

const endpoints = [
  { label: 'health', path: '/healthy', type: /^text\/plain\b/ },
  { label: 'gtm.js', path: `/gtm.js?id=${encodeURIComponent(config.gtmId)}`, type: /^application\/javascript\b/ },
  { label: 'ns.html', path: `/ns.html?id=${encodeURIComponent(config.gtmId)}`, type: /^text\/html\b/ },
  { label: 'gtag/js', path: `/gtag/js?id=${encodeURIComponent(config.canonicalGoogleTagId)}`, type: /^application\/javascript\b/ }
]

async function probe(endpoint) {
  const url = new URL(endpoint.path, config.origin)
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) })
  const body = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || ''

  return {
    label: endpoint.label,
    ok: response.status === 200 && body.byteLength > 0 && endpoint.type.test(contentType),
    status: response.status,
    contentType,
    bytes: body.byteLength
  }
}

const results = await Promise.all(endpoints.map(probe))
const ok = results.every(result => result.ok)
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), origin: config.origin, ok, endpoints: results }, null, 2))
process.exitCode = ok ? 0 : 1
