import type { ConsentSnapshot } from '../pageViewEvent'

export type ProviderDispatchIntent = {
  dispatch_mode: 'server_retry'
  event_id: string
  provider: 'meta' | 'microsoft_uet'
}

type CanonicalDispatchEvent = {
  consent: ConsentSnapshot
  event_id: string
}

export function planCanonicalPageViewDispatch(
  event: CanonicalDispatchEvent
): ProviderDispatchIntent[] {
  if (event.consent.marketing !== 'granted') return []

  return [
    {
      dispatch_mode: 'server_retry',
      event_id: event.event_id,
      provider: 'meta'
    },
    {
      dispatch_mode: 'server_retry',
      event_id: event.event_id,
      provider: 'microsoft_uet'
    }
  ]
}
