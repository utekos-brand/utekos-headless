import {
  CustomData,
  ServerEvent
} from 'facebook-nodejs-business-sdk'
import type { CanonicalSearch } from '../searchEvent'
import { buildMetaUserData } from './buildMetaUserData'

export function mapCanonicalSearchToMeta(
  event: CanonicalSearch
): ServerEvent {
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

  const customData = new CustomData().setSearchString(
    event.custom_data.search_term
  )

  return new ServerEvent()
    .setEventName('Search')
    .setEventTime(eventTime)
    .setUserData(buildMetaUserData(event))
    .setCustomData(customData)
    .setActionSource('website')
    .setEventId(event.event_id)
    .setEventSourceUrl(event.page_url)
}
