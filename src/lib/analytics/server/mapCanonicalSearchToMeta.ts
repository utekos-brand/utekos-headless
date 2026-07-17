import { createHash } from 'node:crypto'
import { CustomData, ServerEvent, UserData } from 'facebook-nodejs-business-sdk'
import type { CanonicalSearch } from '../searchEvent'

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function resolveFbc(event: CanonicalSearch) {
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

function buildUserData(event: CanonicalSearch) {
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

export function mapCanonicalSearchToMeta(event: CanonicalSearch): ServerEvent {
  if (event.consent.marketing !== 'granted') {
    throw new Error('Meta dispatch requires granted marketing consent')
  }

  const eventTime = Math.floor(Date.parse(event.event_time) / 1000)
  if (!Number.isFinite(eventTime)) {
    throw new Error('Meta event_time must be a valid timestamp')
  }

  const customData = new CustomData().setSearchString(
    event.custom_data.search_term
  )

  return new ServerEvent()
    .setEventName('Search')
    .setEventTime(eventTime)
    .setUserData(buildUserData(event))
    .setCustomData(customData)
    .setActionSource('website')
    .setEventId(event.event_id)
    .setEventSourceUrl(event.page_url)
}
