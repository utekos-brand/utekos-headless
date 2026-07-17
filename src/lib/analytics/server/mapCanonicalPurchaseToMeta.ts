import { createHash } from 'node:crypto'
import {
  Content,
  CustomData,
  ServerEvent,
  UserData
} from 'facebook-nodejs-business-sdk'
import type { CanonicalPurchase } from '../purchaseEvent'

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function resolveFbc(event: CanonicalPurchase) {
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

function buildUserData(event: CanonicalPurchase) {
  const userData = new UserData()
  const emailHashes = event.user_data?.email_sha256
  const phoneHashes = event.user_data?.phone_sha256
  const externalId = event.external_id
  const clientIpAddress = event.client_ip_address
  const clientUserAgent = event.event_device_info?.user_agent
  const fbc = resolveFbc(event)
  const fbp = event.browser_id?.fbp

  if (emailHashes?.length) userData.setEmails(emailHashes)
  if (phoneHashes?.length) userData.setPhones(phoneHashes)
  if (externalId) userData.setExternalId(sha256(externalId))
  if (clientIpAddress) userData.setClientIpAddress(clientIpAddress)
  if (clientUserAgent) userData.setClientUserAgent(clientUserAgent)
  if (fbc) userData.setFbc(fbc)
  if (fbp) userData.setFbp(fbp)

  return userData
}

function buildPurchaseContent(
  item: CanonicalPurchase['custom_data']['items'][number]
) {
  return new Content()
    .setId(item.item_id)
    .setQuantity(item.quantity)
    .setItemPrice(item.unit_price)
    .setTitle(item.item_name)
}

function buildPurchaseCustomData(event: CanonicalPurchase) {
  const items = event.custom_data.items
  const contentIds = items.map(item => item.item_id)
  const contents = items.map(buildPurchaseContent)
  const primaryItem = items[0]

  const customData = new CustomData()
    .setCurrency(event.custom_data.currency)
    .setValue(event.custom_data.value)
    .setContentIds(contentIds)
    .setContents(contents)
    .setContentType('product')

  if (primaryItem) {
    customData.setContentName(primaryItem.item_name)
  }

  return customData
}

export function mapCanonicalPurchaseToMeta(
  event: CanonicalPurchase
): ServerEvent {
  if (event.consent.marketing !== 'granted') {
    throw new Error(
      'Meta dispatch requires granted marketing consent'
    )
  }

  const eventTime = Math.floor(Date.parse(event.event_time) / 1000)

  if (!Number.isFinite(eventTime)) {
    throw new Error('Meta event_time must be a valid timestamp')
  }

  const serverEvent = new ServerEvent()
    .setEventName('Purchase')
    .setEventTime(eventTime)
    .setUserData(buildUserData(event))
    .setCustomData(buildPurchaseCustomData(event))
    .setActionSource('website')
    .setEventId(event.event_id)

  if (event.page_url) {
    serverEvent.setEventSourceUrl(event.page_url)
  }

  return serverEvent
}
