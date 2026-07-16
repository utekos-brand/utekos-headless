import type { ConsentSnapshot } from '../pageViewEvent'

export type ProviderDispatchIntent = {
  dispatch_mode: 'server_retry'
  event_id: string
  provider: 'google' | 'meta' | 'microsoft_uet'
}

type CanonicalDispatchEvent = {
  consent: ConsentSnapshot
  event_id: string
  event_name: string
}

export function planCanonicalPageViewDispatch(
  event: CanonicalDispatchEvent
): ProviderDispatchIntent[] {
  const dispatches: ProviderDispatchIntent[] = []

  if (
    event.event_name === 'view_item' &&
    event.consent.analytics === 'granted'
  ) {
    dispatches.push({
      dispatch_mode: 'server_retry',
      event_id: event.event_id,
      provider: 'google'
    })
  }

  if (event.consent.marketing === 'granted') {
    dispatches.push(
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
    )
  }

  return dispatches
}
