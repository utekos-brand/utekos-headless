import { createHash } from 'node:crypto'
import { CustomData, ServerEvent, UserData } from 'facebook-nodejs-business-sdk'
import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

type MetaLeadEvent = CanonicalEventEnvelope & {
  page_url?: string | undefined
  custom_data: {
    currency?: string | undefined
    value?: number | undefined
  }
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function resolveFbc(event: MetaLeadEvent) {
  const existingFbc = event.browser_id?.fbc
  if (existingFbc) return existingFbc

  const fbclid = event.click_id?.fbclid
  if (!fbclid) return undefined

  const eventTimeMs = Date.parse(event.event_time)
  if (!Number.isFinite(eventTimeMs)) {
    throw new Error('Meta event_time must be a valid timestamp')
  }

  return `fb.1.${eventTimeMs}.${fbclid}`
}

function buildUserData(event: MetaLeadEvent) {
  const userData = new UserData()
  const emailHashes = event.user_data?.email_sha256
  const phoneHashes = event.user_data?.phone_sha256
  const clientIpAddress = event.client_ip_address
  const clientUserAgent = event.event_device_info?.user_agent
  const fbc = resolveFbc(event)
  const fbp = event.browser_id?.fbp

  if (emailHashes?.length) userData.setEmails(emailHashes)
  if (phoneHashes?.length) userData.setPhones(phoneHashes)
  if (event.external_id) userData.setExternalId(sha256(event.external_id))
  if (clientIpAddress) userData.setClientIpAddress(clientIpAddress)
  if (clientUserAgent) userData.setClientUserAgent(clientUserAgent)
  if (fbc) userData.setFbc(fbc)
  if (fbp) userData.setFbp(fbp)

  return userData
}

export function mapCanonicalLeadToMeta(event: MetaLeadEvent): ServerEvent {
  if (event.consent.marketing !== 'granted') {
    throw new Error('Meta dispatch requires granted marketing consent')
  }

  const eventTime = Math.floor(Date.parse(event.event_time) / 1000)
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

  const serverEvent = new ServerEvent()
    .setEventName('Lead')
    .setEventTime(eventTime)
    .setUserData(buildUserData(event))
    .setCustomData(customData)
    .setActionSource('website')
    .setEventId(event.event_id)

  if (event.page_url) {
    serverEvent.setEventSourceUrl(event.page_url)
  }

  return serverEvent
}
