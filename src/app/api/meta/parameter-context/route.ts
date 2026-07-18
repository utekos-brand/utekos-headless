import { ipAddress } from '@vercel/functions'
import { NextResponse, type NextRequest } from 'next/server'
import { metaParameterContextRequestSchema } from '@/lib/analytics/metaParameterContextContract'
import { processMetaParameterContext } from '@/lib/analytics/server/processMetaParameterContext'

const MAX_BODY_BYTES = 16 * 1024
const PRODUCTION_COOKIE_DOMAIN = 'utekos.no'
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Vary': 'Cookie'
}

function hasJsonMediaType(request: Request) {
  return (
    request.headers
      .get('content-type')
      ?.split(';', 1)[0]
      ?.trim()
      .toLowerCase() === 'application/json'
  )
}

function hasSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

function resolveCookieDomain(hostname: string) {
  return (
      hostname === PRODUCTION_COOKIE_DOMAIN ||
        hostname.endsWith(`.${PRODUCTION_COOKIE_DOMAIN}`)
    ) ?
      PRODUCTION_COOKIE_DOMAIN
    : undefined
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json(
      { error: 'forbidden_origin' },
      { headers: NO_STORE_HEADERS, status: 403 }
    )
  }

  if (!hasJsonMediaType(request)) {
    return NextResponse.json(
      { error: 'unsupported_media_type' },
      { headers: NO_STORE_HEADERS, status: 415 }
    )
  }

  const declaredLength = Number(
    request.headers.get('content-length') ?? 0
  )
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'payload_too_large' },
      { headers: NO_STORE_HEADERS, status: 413 }
    )
  }

  const body = await request.text()
  if (
    new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES
  ) {
    return NextResponse.json(
      { error: 'payload_too_large' },
      { headers: NO_STORE_HEADERS, status: 413 }
    )
  }

  let input: unknown
  try {
    input = JSON.parse(body)
  } catch {
    return NextResponse.json(
      { error: 'invalid_json' },
      { headers: NO_STORE_HEADERS, status: 400 }
    )
  }

  const parsed =
    metaParameterContextRequestSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_context' },
      { headers: NO_STORE_HEADERS, status: 400 }
    )
  }

  const requestOrigin = new URL(request.url).origin
  const pageUrl = new URL(parsed.data.page_url)
  if (pageUrl.origin !== requestOrigin) {
    return NextResponse.json(
      { error: 'invalid_page_origin' },
      { headers: NO_STORE_HEADERS, status: 400 }
    )
  }

  const clientIpAddress = ipAddress(request)
  const processed = processMetaParameterContext({
    payload: parsed.data,
    cookies: Object.fromEntries(
      request.cookies
        .getAll()
        .map(cookie => [cookie.name, cookie.value])
    ),
    ...(clientIpAddress ? { clientIpAddress } : {})
  })
  const response = NextResponse.json(processed.identifiers, {
    headers: NO_STORE_HEADERS
  })
  const domain = resolveCookieDomain(pageUrl.hostname)

  for (const cookie of processed.cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, {
      ...(domain ? { domain } : {}),
      httpOnly: false,
      maxAge: cookie.maxAge,
      path: '/',
      sameSite: 'lax',
      secure: pageUrl.protocol === 'https:'
    })
  }

  return response
}
