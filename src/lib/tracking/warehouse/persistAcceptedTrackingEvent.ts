import 'server-only'

import { getTrackingIdempotencyKey } from '@/lib/tracking/warehouse/getTrackingIdempotencyKey'
import { getTrackingLedgerPayload } from '@/lib/tracking/warehouse/getTrackingLedgerPayload'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { MetaEventPayload } from 'types/tracking/meta'
import type postgres from 'postgres'

type TrackingProvider = 'meta' | 'google'

type TrackingConsent = {
  necessary: boolean
  preferences: boolean
  statistics: boolean
  marketing: boolean
  services: Record<string, boolean>
  source: 'usercentrics' | 'shopify'
}

export async function persistAcceptedTrackingEvent(
  payload: MetaEventPayload,
  consent?: TrackingConsent,
  providers: readonly TrackingProvider[] = []
): Promise<void> {
  const sql = getTrackingWarehouse()
  const eventId = payload.eventId
  const eventName = payload.eventName

  if (!sql || !eventName || !eventId) {
    return
  }

  const idempotencyKey = getTrackingIdempotencyKey(eventName, eventId)
  const occurredAt = new Date((payload.eventTime ?? Math.floor(Date.now() / 1000)) * 1000)
  const userDataQuality = {
    hasFbp: !!payload.userData?.fbp,
    hasFbc: !!payload.userData?.fbc,
    hasExternalId: !!payload.userData?.external_id,
    hasEmail: !!payload.userData?.email || !!payload.userData?.email_hash,
    hasClientIp: !!payload.userData?.client_ip_address,
    hasUserAgent: !!payload.userData?.client_user_agent
  }

  await sql.begin(async transaction => {
    await transaction`
      insert into marketing.event_ledger (
        event_id,
        event_name,
        idempotency_key,
        anonymous_id,
        external_id,
        source_url,
        consent,
        user_data_quality,
        payload,
        occurred_at
      )
      values (
        ${eventId},
        ${eventName},
        ${idempotencyKey},
        ${payload.ga4Data?.client_id ?? null},
        ${payload.userData?.external_id ?? null},
        ${payload.eventSourceUrl ?? null},
        ${transaction.json((consent ?? {}) as postgres.JSONValue)},
        ${transaction.json(userDataQuality)},
        ${transaction.json(getTrackingLedgerPayload(payload) as postgres.JSONValue)},
        ${occurredAt}
      )
      on conflict (idempotency_key) do nothing
    `

    for (const provider of providers) {
      await transaction`
        insert into ops.provider_dispatch_attempts (
          idempotency_key,
          provider,
          event_id,
          event_name,
          payload,
          consent_basis,
          data_quality,
          status,
          next_attempt_at
        )
        values (
          ${idempotencyKey},
          ${provider},
          ${eventId},
          ${eventName},
          ${transaction.json(payload as postgres.JSONValue)},
          ${transaction.json((consent ?? {}) as postgres.JSONValue)},
          ${transaction.json(userDataQuality)},
          'pending',
          now() + interval '2 minutes'
        )
        on conflict (provider, idempotency_key) do nothing
      `
    }
  })
}
