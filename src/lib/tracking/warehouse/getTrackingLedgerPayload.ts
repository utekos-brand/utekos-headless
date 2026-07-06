import type { MetaEventPayload } from 'types/tracking/meta'

export function getTrackingLedgerPayload(payload: MetaEventPayload): Record<string, unknown> {
  return {
    eventName: payload.eventName,
    canonicalEventName: payload.canonicalEventName,
    schemaVersion: payload.schemaVersion,
    classification: payload.classification,
    source: payload.source,
    occurredAt: payload.occurredAt,
    eventId: payload.eventId,
    eventSourceUrl: payload.eventSourceUrl,
    eventTime: payload.eventTime,
    actionSource: payload.actionSource,
    eventData: payload.eventData,
    ga4Data: payload.ga4Data ? { hasClientId: !!payload.ga4Data.client_id } : undefined
  }
}
