import {
  FacebookAdsApi,
  ServerEvent,
  EventRequest,
  UserData,
  CustomData,
  Content
} from 'facebook-nodejs-business-sdk'
import type { MetaEventPayload, ClientUserData, MetaContentItem } from 'types/tracking/meta'
import { normalizeAndHashMetaUserData } from '@/lib/tracking/meta/normalizeAndHashMetaUserData'
import { resolveMetaPixelId } from '@/lib/tracking/meta/utils/resolveMetaPixelId'
import { resolveMetaAccessToken } from '@/lib/tracking/meta/utils/resolveMetaAccessToken'

export async function sendMetaBrowserEvent(payload: MetaEventPayload, userData: ClientUserData) {
  if (process.env.META_CAPI_ENABLED === 'false') {
    throw new Error('Meta CAPI dispatch disabled while credentials are unavailable')
  }

  const accessToken = resolveMetaAccessToken()
  const pixelId = resolveMetaPixelId()
  const testEventCode = process.env.META_TEST_EVENT_CODE

  if (!accessToken || !pixelId) throw new Error('Missing Meta Credentials')
  if (!payload.eventName) throw new Error('Missing eventName in payload')

  FacebookAdsApi.init(accessToken)

  const normalizedUserData = normalizeAndHashMetaUserData(userData)
  const user = new UserData()
  if (normalizedUserData.client_ip_address) user.setClientIpAddress(normalizedUserData.client_ip_address)
  if (normalizedUserData.client_user_agent) user.setClientUserAgent(normalizedUserData.client_user_agent)
  if (normalizedUserData.fbp) user.setFbp(normalizedUserData.fbp)
  if (normalizedUserData.fbc) user.setFbc(normalizedUserData.fbc)
  if (normalizedUserData.external_id) user.setExternalId(normalizedUserData.external_id)
  if (normalizedUserData.email) user.setEmail(normalizedUserData.email)
  else if (normalizedUserData.email_hash) user.setEmails([normalizedUserData.email_hash])

  if (normalizedUserData.phone) user.setPhone(normalizedUserData.phone)
  if (normalizedUserData.first_name) user.setFirstName(normalizedUserData.first_name)
  if (normalizedUserData.last_name) user.setLastName(normalizedUserData.last_name)
  if (normalizedUserData.date_of_birth) user.setDateOfBirth(normalizedUserData.date_of_birth)
  if (normalizedUserData.gender) user.setGender(normalizedUserData.gender)
  if (normalizedUserData.city) user.setCity(normalizedUserData.city)
  if (normalizedUserData.state) user.setState(normalizedUserData.state)
  if (normalizedUserData.zip) user.setZip(normalizedUserData.zip)
  if (normalizedUserData.country) user.setCountry(normalizedUserData.country)

  const custom = new CustomData()
  const { eventData } = payload

  if (eventData) {
    if (eventData.value !== undefined) custom.setValue(eventData.value)
    if (eventData.currency) custom.setCurrency(eventData.currency)
    if (eventData.content_name) custom.setContentName(eventData.content_name)
    if (eventData.content_type) custom.setContentType(eventData.content_type)
    if (eventData.content_category) custom.setContentCategory(eventData.content_category)
    if (eventData.search_string) custom.setSearchString(eventData.search_string)
    if (eventData.num_items) custom.setNumItems(eventData.num_items)
    if (eventData.content_ids) custom.setContentIds(eventData.content_ids)

    if (eventData.contents && Array.isArray(eventData.contents)) {
      const contentList = eventData.contents.map((item: MetaContentItem) => {
        const content = new Content()
          .setId(item.id)
          .setQuantity(item.quantity)
          .setItemPrice(item.item_price ?? 0)

        const title = item.title || item.content_name
        if (title) content.setTitle(title)

        return content
      })
      custom.setContents(contentList)
    }
  }

  const serverEvent = new ServerEvent()
    .setEventName(payload.eventName)
    .setEventTime(payload.eventTime || Math.floor(Date.now() / 1000))
    .setUserData(user)
    .setCustomData(custom)

  if (payload.eventId) serverEvent.setEventId(payload.eventId)
  if (payload.eventSourceUrl) serverEvent.setEventSourceUrl(payload.eventSourceUrl)

  serverEvent.setActionSource(payload.actionSource || 'website')

  const eventRequest = new EventRequest(accessToken, pixelId).setEvents([serverEvent])
  if (testEventCode) eventRequest.setTestEventCode(testEventCode)

  return await eventRequest.execute()
}
