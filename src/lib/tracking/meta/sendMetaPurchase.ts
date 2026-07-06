import {
  FacebookAdsApi,
  ServerEvent,
  EventRequest,
  UserData,
  CustomData,
  Content
} from 'facebook-nodejs-business-sdk'
import { getMetaPurchaseEventTime } from '@/lib/tracking/meta/utils/getMetaPurchaseEventTime'
import { safeString } from '@/lib/utils/safeString'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { resolveMetaPixelId } from '@/lib/tracking/meta/utils/resolveMetaPixelId'
import { resolveMetaAccessToken } from '@/lib/tracking/meta/utils/resolveMetaAccessToken'
import { normalizeAndHashMetaUserData } from '@/lib/tracking/meta/normalizeAndHashMetaUserData'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'
import type { MetaApiError } from './types'

export async function sendMetaPurchase({ order, customer, redisData, contentIds }: TrackingContext) {
  const accessToken = resolveMetaAccessToken()
  const pixelId = resolveMetaPixelId()
  const testEventCode = process.env.META_TEST_EVENT_CODE

  if (!accessToken || !pixelId) {
    console.error('[Meta CAPI] Critical: Missing Configuration')
    return { success: false, error: 'Missing Config' }
  }

  const api = FacebookAdsApi.init(accessToken)
  if (process.env.NODE_ENV === 'development') {
    api.setDebug(true)
  }

  const normalizedUserData = normalizeAndHashMetaUserData({
    email: customer.email,
    phone: customer.phone,
    external_id: customer.externalId,
    first_name: customer.firstName,
    last_name: customer.lastName,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    country: customer.countryCode,
    client_ip_address: customer.clientIp,
    client_user_agent: customer.userAgent,
    fbp: customer.fbp,
    fbc: customer.fbc
  })

  const userData = new UserData()
  if (normalizedUserData.email) userData.setEmail(normalizedUserData.email)
  if (normalizedUserData.phone) userData.setPhone(normalizedUserData.phone)
  if (normalizedUserData.external_id) userData.setExternalId(normalizedUserData.external_id)
  if (normalizedUserData.first_name) userData.setFirstName(normalizedUserData.first_name)
  if (normalizedUserData.last_name) userData.setLastName(normalizedUserData.last_name)
  if (normalizedUserData.city) userData.setCity(normalizedUserData.city)
  if (normalizedUserData.state) userData.setState(normalizedUserData.state)
  if (normalizedUserData.zip) userData.setZip(normalizedUserData.zip)
  if (normalizedUserData.country) userData.setCountry(normalizedUserData.country)
  if (normalizedUserData.client_ip_address) userData.setClientIpAddress(normalizedUserData.client_ip_address)
  if (normalizedUserData.client_user_agent) userData.setClientUserAgent(normalizedUserData.client_user_agent)
  if (normalizedUserData.fbp) userData.setFbp(normalizedUserData.fbp)
  if (normalizedUserData.fbc) userData.setFbc(normalizedUserData.fbc)

  const contentList: Content[] = []
  if (order.line_items) {
    for (const item of order.line_items) {
      const id = safeString(item.variant_id) || safeString(item.product_id)
      if (!id) continue
      contentList.push(
        new Content()
          .setId(id)
          .setQuantity(Number(item.quantity || 0))
          .setItemPrice(Number(item.price || 0))
          .setTitle(safeString(item.title) || '')
      )
    }
  }

  const customData = new CustomData()
    .setCurrency(safeString(order.currency) || 'NOK')
    .setValue(Number(order.total_price || 0))
    .setContents(contentList)
    .setContentIds(contentIds)
    .setContentType('product')

  if (order.id) customData.setOrderId(safeString(order.id)!)

  const serverEvent = new ServerEvent()
    .setEventName('Purchase')
    .setEventTime(getMetaPurchaseEventTime(order))
    .setActionSource('website')
    .setEventId(`shopify_order_${order.id}`)
    .setUserData(userData)
    .setCustomData(customData)
    .setEventSourceUrl(safeString(order.order_status_url) || redisData?.checkoutUrl || 'https://utekos.no')

  try {
    const eventRequest = new EventRequest(accessToken, pixelId).setEvents([serverEvent])
    if (testEventCode) eventRequest.setTestEventCode(testEventCode)

    const response = await eventRequest.execute()

    await logToAppLogs(
      'INFO',
      '💵💵💵💵💵💵💵 CAPI Purchase Sent 💵💵💵💵💵💵💵',
      {
        fbtrace_id: response.fbtrace_id,
        events_received: response.events_received,
        orderId: order.id
      },
      {
        hasFbp: !!userData.fbp,
        hasFbc: !!userData.fbc,
        hasClientIp: !!userData.client_ip_address,
        eventTime: serverEvent.event_time
      }
    )

    return {
      success: true,
      events_received: response.events_received,
      fbtrace_id: response.fbtrace_id
    }
  } catch (error: unknown) {
    const err = error as MetaApiError
    const errorResponse = err.response?.data || {}
    const graphError = errorResponse.error
    console.error('[Meta CAPI] Request Failed:', JSON.stringify(errorResponse, null, 2))

    await logToAppLogs(
      'ERROR',
      'CAPI Purchase Failed',
      {
        orderId: order.id,
        eventId: `shopify_order_${order.id}`,
        eventTime: serverEvent.event_time,
        error: err.message,
        graphCode: graphError?.code,
        graphSubcode: graphError?.error_subcode,
        graphMessage: graphError?.message,
        graphType: graphError?.type,
        fbtrace_id: graphError?.fbtrace_id,
        details: graphError
      },
      {}
    )

    return {
      success: false,
      error: 'Meta CAPI request failed',
      details: errorResponse.error || err.message
    }
  }
}
