import type { NextRequest } from 'next/server'
import { parseAndValidateCaptureRequest } from '@/lib/tracking/capture/parseAndValidateCaptureRequest'
import { adaptRequestToCaptureContext } from '@/lib/tracking/capture/adaptRequestToCaptureContext'
import { createCaptureResponse } from '@/lib/tracking/capture/createCaptureResponse'
import { getRequestConsentState } from '@/lib/tracking/consent/getRequestConsentState'
import {
  buildConsentProvenance,
  hasCheckoutIdentifierCaptureConsent
} from '@/lib/tracking/consent/buildConsentProvenance'
import type { CaptureContext, CaptureResult } from 'types/tracking/capture'
import type { CaptureBody } from 'types/tracking/meta'

export type CheckoutIdentifierCaptureDependencies = {
  syncCartMarketingAttributes: (
    cartId: string | null | undefined
  ) => Promise<unknown>
  captureIdentifiers: (
    tokens: string[],
    body: CaptureBody,
    context: CaptureContext
  ) => Promise<CaptureResult>
}

export async function handleCheckoutIdentifierCapture(
  request: NextRequest,
  dependencies: CheckoutIdentifierCaptureDependencies
): Promise<Response> {
  const validation = await parseAndValidateCaptureRequest(request)

  if (!validation.success) {
    return validation.errorResponse
  }

  const consentProvenance = buildConsentProvenance(getRequestConsentState(request))

  if (!hasCheckoutIdentifierCaptureConsent(consentProvenance)) {
    return new Response(null, { status: 204 })
  }

  const context = adaptRequestToCaptureContext(
    request,
    validation.body,
    consentProvenance
  )
  const advertisingConsent = consentProvenance.services.googleAds
    || consentProvenance.services.meta
    || consentProvenance.services.microsoftAdvertising

  if (advertisingConsent) {
    await dependencies.syncCartMarketingAttributes(validation.body.cartId)
  }

  const result = await dependencies.captureIdentifiers(
    validation.tokens,
    validation.body,
    context
  )

  return createCaptureResponse(result)
}
