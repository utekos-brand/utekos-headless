import { createHash } from 'node:crypto'
import {
  Content,
  CustomData,
  ServerEvent,
  UserData
} from 'facebook-nodejs-business-sdk'
import type { CanonicalCommerceItem } from '../canonicalCommerceItem'
import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

const SHOPIFY_VARIANT_GID =
  /^gid:\/\/shopify\/ProductVariant\/(\d+)$/

type MetaCommerceEvent = CanonicalEventEnvelope & {
  page_url: string
  custom_data: {
    currency: string
    gross_value: number
    items: CanonicalCommerceItem[]
  }
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function getMetaContentId(variantId: string) {
  const match = SHOPIFY_VARIANT_GID.exec(variantId)

  if (!match?.[1]) {
    throw new Error(
      'Meta content_id requires a Shopify ProductVariant GID'
    )
  }

  return match[1]
}

function resolveFbc(event: MetaCommerceEvent) {
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

function buildUserData(event: MetaCommerceEvent) {
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
  if (clientIpAddress) {
    userData.setClientIpAddress(clientIpAddress)
  }
  if (clientUserAgent) {
    userData.setClientUserAgent(clientUserAgent)
  }
  if (fbc) userData.setFbc(fbc)
  if (fbp) userData.setFbp(fbp)

  return userData
}

function buildContent(item: CanonicalCommerceItem) {
  const content = new Content()
    .setId(getMetaContentId(item.variant_id))
    .setQuantity(item.quantity)
    .setItemPrice(item.gross_unit_price)
    .setTitle(item.item_name)
  const category = item.item_category ?? item.product_type

  if (item.item_brand) content.setBrand(item.item_brand)
  if (category) content.setCategory(category)

  return content
}

function buildCustomData(event: MetaCommerceEvent) {
  const items = event.custom_data.items
  const contentIds = items.map(item =>
    getMetaContentId(item.variant_id)
  )
  const contents = items.map(buildContent)
  const primaryItem = items[0]
  const customData = new CustomData()
    .setCurrency(event.custom_data.currency)
    .setValue(event.custom_data.gross_value)
    .setContentIds(contentIds)
    .setContents(contents)
    .setContentType('product')

  if (primaryItem) {
    customData.setContentName(primaryItem.item_name)

    const category =
      primaryItem.item_category ?? primaryItem.product_type
    if (category) customData.setContentCategory(category)
  }

  return customData
}

export function mapCanonicalCommerceEventToMeta(
  event: MetaCommerceEvent,
  metaEventName: string
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

  return new ServerEvent()
    .setEventName(metaEventName)
    .setEventTime(eventTime)
    .setUserData(buildUserData(event))
    .setCustomData(buildCustomData(event))
    .setActionSource('website')
    .setEventId(event.event_id)
    .setEventSourceUrl(event.page_url)
}
