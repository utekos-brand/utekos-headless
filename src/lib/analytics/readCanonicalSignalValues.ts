import type { CanonicalEventEnvelope } from './canonicalEventEnvelope'
import {
  canonicalSignalValuesSchema,
  type CanonicalClickIds,
  type CanonicalSignalValues
} from './canonicalSignalContract'

function nonEmptyClickIds(
  clickIds: CanonicalClickIds | undefined
): CanonicalClickIds | undefined {
  if (!clickIds) return undefined
  return Object.keys(clickIds).length > 0 ? clickIds : undefined
}

export function readCanonicalSignalValues(
  event: CanonicalEventEnvelope
): CanonicalSignalValues {
  const clickIds = nonEmptyClickIds(event.click_id)

  return canonicalSignalValuesSchema.parse({
    event_id: event.event_id,
    event_name: event.event_name,
    event_time: event.event_time,
    ...(event.page_url ?
      { event_source_url: event.page_url }
    : {}),
    ...(event.client_ip_address ?
      { client_ip_address: event.client_ip_address }
    : {}),
    ...(event.event_device_info?.user_agent ?
      { client_user_agent: event.event_device_info.user_agent }
    : {}),
    ...(event.external_id ?
      { external_id: event.external_id }
    : {}),
    ...(clickIds ? { click_ids: clickIds } : {}),
    ...(clickIds?.fbclid ? { fbclid: clickIds.fbclid } : {}),
    ...(event.browser_id?.fbc ?
      { fbc: event.browser_id.fbc }
    : {}),
    ...(event.browser_id?.fbp ?
      { fbp: event.browser_id.fbp }
    : {})
  })
}
