import 'server-only'
import { handlePurchaseEvent } from '@/lib/tracking/google/handlePurchaseEvents'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'

type RedisGoogleIds = {
  ga_client_id?: string
  ga_session_id?: string
  gaClientId?: string
  gaSessionId?: string
}

export type GooglePurchaseDispatchResult =
  | {
      success: true
      orderId: string | number | undefined
      requestId: string
      transactionId: string
      value: number
      currency: string
      itemCount: number
      transport: 'direct_ga4'
      httpStatus?: number | undefined
      validationStatus?: number | undefined
      validationMessageCount?: number | undefined
    }
  | {
      success: false
      orderId: string | number | undefined
      error: string
      details?: Record<string, unknown>
    }

export async function sendGooglePurchase(
  context: TrackingContext
): Promise<GooglePurchaseDispatchResult> {
  const { order, redisData } = context
  const googleIds = (redisData ?? {}) as RedisGoogleIds
  const clientId = googleIds.ga_client_id || googleIds.gaClientId
  const sessionId = googleIds.ga_session_id || googleIds.gaSessionId

  try {
    const res = await handlePurchaseEvent(order, {
      clientId,
      sessionId
    })

    if (!res.sent) {
      await logToAppLogs(
        'WARN',
        'GA4 Purchase Skipped',
        {
          orderId: order.id,
          reason: res.reason,
          hasRedisClientId: !!clientId,
          hasRedisSessionId: !!sessionId,
          requestId:
            typeof res.details?.requestId === 'string' ?
              res.details.requestId
            : undefined,
          ...(res.details ? { details: res.details } : {})
        },
        { source: 'orders-paid webhook' }
      )

      return {
        success: false,
        orderId: order.id,
        error: res.reason,
        ...(res.details ? { details: res.details } : {})
      }
    }

    await logToAppLogs(
      'INFO',
      'GA4 Purchase Dispatch Success',
      {
        orderId: order.id,
        requestId: res.payload.requestId,
        transactionId: res.payload.transactionId,
        value: res.payload.value,
        currency: res.payload.currency,
        itemCount: res.payload.itemCount,
        transport: res.payload.transport,
        validationStatus: res.payload.diagnostics?.validation?.status,
        validationMessageCount: res.payload.diagnostics?.validation?.messageCount,
        directGa4Status: res.payload.diagnostics?.directGa4?.status,
        hasRedisClientId: !!clientId,
        hasRedisSessionId: !!sessionId
      },
      { source: 'orders-paid webhook' }
    )

    return {
      success: true,
      orderId: order.id,
      requestId: res.payload.requestId,
      transactionId: res.payload.transactionId,
      value: res.payload.value,
      currency: res.payload.currency,
      itemCount: res.payload.itemCount,
      transport: res.payload.transport,
      httpStatus: res.payload.diagnostics.directGa4.status,
      validationStatus: res.payload.diagnostics.validation.status,
      validationMessageCount: res.payload.diagnostics.validation.messageCount
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    await logToAppLogs(
      'ERROR',
      'GA4 Purchase Dispatch Failed',
      { orderId: order.id, error: errorMessage },
      { source: 'orders-paid webhook' }
    )

    return {
      success: false,
      orderId: order.id,
      error: errorMessage
    }
  }
}
