import { getKlarnaPublicConfig } from '@/lib/klarna/getKlarnaPublicConfig'
import { getKlarnaServerConfig } from '@/lib/klarna/config'
import { connection } from 'next/server'

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff'
}

export async function GET(): Promise<Response> {
  await connection()

  try {
    const publicConfig = getKlarnaPublicConfig()
    getKlarnaServerConfig()

    return Response.json(publicConfig, {
      headers: RESPONSE_HEADERS
    })
  } catch {
    return Response.json(
      { error: 'Klarna public configuration is unavailable.' },
      { status: 503, headers: RESPONSE_HEADERS }
    )
  }
}
