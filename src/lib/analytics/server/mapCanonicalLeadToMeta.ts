import {
  CustomData
} from 'facebook-nodejs-business-sdk'
import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'
import { buildMetaUserData } from './buildMetaUserData'
import { buildMetaRequestContext } from './buildMetaRequestContext'
import { MetaServerEvent } from './MetaServerEvent'

type MetaLeadEvent = CanonicalEventEnvelope & {
  page_url?: string | undefined
  custom_data: {
    currency?: string | undefined
    value?: number | undefined
  }
}

export function mapCanonicalLeadToMeta(
  event: MetaLeadEvent
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

  const customData = new CustomData()
  if (event.custom_data.currency) {
    customData.setCurrency(event.custom_data.currency)
  }
  if (event.custom_data.value !== undefined) {
    customData.setValue(event.custom_data.value)
  }

  const serverEvent = new MetaServerEvent()
  serverEvent
    .setEventName('Lead')
    .setEventTime(eventTime)
    .setUserData(buildMetaUserData(event))
    .setCustomData(customData)
    .setActionSource('website')
    .setEventId(event.event_id)

  if (event.page_url) {
    serverEvent.setRequestContext(
      buildMetaRequestContext({ ...event, page_url: event.page_url })
    )
  }

  return serverEvent
}
