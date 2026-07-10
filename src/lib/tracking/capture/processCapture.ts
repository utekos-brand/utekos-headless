// Path: src/lib/tracking/capture/processCapture.ts
import { prepareCaptureData } from '@/lib/tracking/capture/prepareCaptureData'
import type {
  CaptureDependencies,
  CaptureContext,
  CaptureResult
} from 'types/tracking/capture'
import type { CaptureBody } from 'types/tracking/meta'

export async function processCapture(
  tokens: string | string[],
  body: CaptureBody,
  context: CaptureContext,
  deps: CaptureDependencies
): Promise<CaptureResult> {
  const payload = prepareCaptureData(body, context)
  const { userData } = payload
  const storageTokens = Array.isArray(tokens) ? tokens : [tokens]
  const primaryToken = storageTokens[0]
  const snapshotWrite = deps.persistCheckoutAttributionSnapshot ?
    deps.persistCheckoutAttributionSnapshot(payload, storageTokens).catch(async error => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown snapshot persistence error'
      await deps.logger(
        'ERROR',
        'Checkout attribution snapshot persistence failed',
        { error: errorMessage, storageTokenCount: storageTokens.length },
        { token: primaryToken }
      )
    })
  : Promise.resolve()

  await deps.logger(
    'INFO',
    '📩📩📩 Capture Identifiers 📩📩📩',
    {
      cartId: payload.cartId,
      hasFbp: !!userData.fbp,
      hasFbc: !!userData.fbc,
      hasScid: !!userData.scid,
      hasClickId: !!userData.click_id,
      gclid: payload.gclid ? 'Captured' : 'Missing',
      gbraid: payload.gbraid ? 'Captured' : 'Missing',
      wbraid: payload.wbraid ? 'Captured' : 'Missing',
      msclkid: payload.msclkid ? 'Captured' : 'Missing',
      dclid: payload.dclid ? 'Captured' : 'Missing',
      hasExternalId: !!userData.external_id,
      hasEmailHash: !!userData.email_hash,
      hasClientIp: !!userData.client_ip_address,
      ga_client_id: payload.ga_client_id ? 'Captured' : 'Missing',
      ga_session_id: payload.ga_session_id ? 'Captured' : 'Missing'
    },
    {
      token: primaryToken,
      storageTokenCount: storageTokens.length,
      checkoutUrl: payload.checkoutUrl
    }
  )

  try {
    await Promise.all(
      storageTokens.map(token => deps.redisSet(`checkout:${token}`, payload, 604800))
    )
    await snapshotWrite
    return { success: true }
  } catch (error: unknown) {
    await snapshotWrite
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown Redis error'
    await deps.logger(
      'ERROR',
      'Redis save failed',
      { error: errorMessage, storageTokenCount: storageTokens.length },
      { token: primaryToken }
    )

    return { success: false, error: 'Failed to save checkout data' }
  }
}
