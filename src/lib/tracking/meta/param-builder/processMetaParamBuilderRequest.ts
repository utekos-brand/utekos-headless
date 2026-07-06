import type { CookieSettings } from 'capi-param-builder-nodejs'
import type { NextRequest } from 'next/server'
import { createMetaParamBuilder } from '@/lib/tracking/meta/param-builder/createMetaParamBuilder'
import { getRemoteAddress } from '@/lib/tracking/meta/param-builder/getRemoteAddress'
import { getRequestCookieObject } from '@/lib/tracking/meta/param-builder/getRequestCookieObject'
import { getRequestQueryObject } from '@/lib/tracking/meta/param-builder/getRequestQueryObject'

export interface ProcessedMetaParamBuilderRequest {
  cookiesToSet: CookieSettings[]
  fbc?: string | undefined
  fbp?: string | undefined
  clientIp?: string | undefined
}

function normalizeOptionalValue(value: string | null): string | undefined {
  return value && value.length > 0 ? value : undefined
}

export function processMetaParamBuilderRequest(
  request: NextRequest,
  fallbackClientIp: string
): ProcessedMetaParamBuilderRequest {
  const builder = createMetaParamBuilder()
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const remoteAddress = getRemoteAddress(request, fallbackClientIp)
  const host = request.headers.get('host') ?? request.nextUrl.host

  const cookiesToSet = builder.processRequest(
    host,
    getRequestQueryObject(request),
    getRequestCookieObject(request),
    request.headers.get('referer'),
    xForwardedFor,
    remoteAddress
  )

  return {
    cookiesToSet,
    fbc: normalizeOptionalValue(builder.getFbc()),
    fbp: normalizeOptionalValue(builder.getFbp()),
    clientIp: normalizeOptionalValue(builder.getClientIpAddress())
  }
}
