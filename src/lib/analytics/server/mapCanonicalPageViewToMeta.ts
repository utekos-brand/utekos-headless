import type { CanonicalPageView } from '../pageViewEvent'
import { buildMetaUserData } from './buildMetaUserData'
import { buildMetaRequestContext } from './buildMetaRequestContext'
import { MetaServerEvent } from './MetaServerEvent'

export function mapCanonicalPageViewToMeta(
  event: CanonicalPageView
): MetaServerEvent {
  if (event.consent.marketing !== 'granted') {
    throw new Error(
      'Meta dispatch requires granted marketing consent'
    )
  }

  const eventTime = Math.floor(
    Date.parse(event.event_time) / 1000
  )
  if (!Number.isFinite(eventTime)) {
    throw new Error('Meta event_time must be a valid timestamp')
  }

  const serverEvent = new MetaServerEvent()
  serverEvent
    .setEventName('PageView')
    .setEventTime(eventTime)
    .setUserData(buildMetaUserData(event))
    .setActionSource('website')
    .setEventId(event.event_id)

  serverEvent.setRequestContext(buildMetaRequestContext(event))
  return serverEvent
}
