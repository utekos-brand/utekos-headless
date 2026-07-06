const TRACKING_DISABLED_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Utekos-Measurement-Endpoint': 'local-disabled'
} satisfies HeadersInit

function noContent() {
  return new Response(null, {
    status: 204,
    headers: TRACKING_DISABLED_HEADERS
  })
}

export function GET() {
  return noContent()
}

export const POST = GET
