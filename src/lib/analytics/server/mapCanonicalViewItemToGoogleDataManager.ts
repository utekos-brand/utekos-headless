import { protos } from '@google-ads/datamanager'
import type { CanonicalViewItem } from '../viewItemEvent'

type DataManagerItem =
  protos.google.ads.datamanager.v1.IItem
type DataManagerParameter =
  protos.google.ads.datamanager.v1.IEventParameter

const GA_CLIENT_ID = /^\d+\.\d+$/
const GA_COOKIE = /^GA\d+\.\d+\.(\d+\.\d+)$/
const SUBDIVISION_CODE = /^[A-Z]{2}-[A-Z0-9]{1,3}$/
const REGION_PART = /^[A-Z0-9]{1,3}$/
const {
  ConsentStatus,
  Event: DataManagerEvent,
  EventSource
} = protos.google.ads.datamanager.v1

function resolveClientId(event: CanonicalViewItem) {
  const candidate =
    event.browser_id?.ga_client_id
    ?? event.browser_id?.ga_client
    ?? event.browser_id?.ga_cookie

  if (!candidate) {
    throw new Error(
      'Google Data Manager view_item requires a GA client ID'
    )
  }

  const normalized = candidate.trim()
  if (GA_CLIENT_ID.test(normalized)) return normalized

  const cookieMatch = GA_COOKIE.exec(normalized)
  if (cookieMatch?.[1]) return cookieMatch[1]

  throw new Error(
    'Google Data Manager view_item requires a valid GA client ID'
  )
}

function mapTimestamp(eventTime: string) {
  const milliseconds = Date.parse(eventTime)

  if (!Number.isFinite(milliseconds)) {
    throw new Error(
      'Google Data Manager event_time must be a valid timestamp'
    )
  }

  return {
    seconds: Math.floor(milliseconds / 1000),
    nanos: (milliseconds % 1000) * 1_000_000
  }
}

function parameter(
  parameterName: string,
  value: string | number | boolean | null | undefined
): DataManagerParameter | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return { parameterName, value: String(value) }
}

function compactParameters(
  parameters: Array<DataManagerParameter | undefined>
) {
  return parameters.filter(
    (candidate): candidate is DataManagerParameter =>
      candidate !== undefined
  )
}

function mapItem(
  item: CanonicalViewItem['custom_data']['items'][number]
): DataManagerItem {
  return {
    itemId: item.item_id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    additionalItemParameters: compactParameters([
      parameter('item_name', item.item_name),
      parameter('item_brand', item.item_brand),
      parameter('item_variant', item.item_variant),
      parameter('item_category', item.item_category),
      parameter('item_category2', item.item_category2),
      parameter('item_category3', item.item_category3),
      parameter('item_category4', item.item_category4),
      parameter('item_category5', item.item_category5),
      parameter('discount', item.discount),
      parameter('product_id', item.product_id),
      parameter('variant_id', item.variant_id),
      parameter('product_handle', item.product_handle),
      parameter('product_type', item.product_type),
      parameter('sku', item.sku),
      parameter('gtin', item.gtin),
      parameter('tax_amount', item.tax_amount),
      parameter('tax_rate', item.tax_rate),
      parameter('taxable', item.taxable),
      parameter(
        'price_includes_tax',
        item.price_includes_tax
      ),
      parameter('gross_unit_price', item.gross_unit_price),
      parameter(
        'compare_at_unit_price',
        item.compare_at_unit_price
      ),
      parameter(
        'gross_compare_at_unit_price',
        item.gross_compare_at_unit_price
      ),
      parameter('gross_discount', item.gross_discount),
      parameter(
        'available_for_sale',
        item.available_for_sale
      ),
      parameter(
        'currently_not_in_stock',
        item.currently_not_in_stock
      ),
      parameter(
        'quantity_available',
        item.quantity_available
      )
    ])
  }
}

function mapConsent(event: CanonicalViewItem) {
  const advertisingConsent =
    event.consent.marketing === 'granted' ?
      ConsentStatus.CONSENT_GRANTED
    : ConsentStatus.CONSENT_DENIED

  return {
    adUserData: advertisingConsent,
    adPersonalization: advertisingConsent
  }
}

function mapUserData(event: CanonicalViewItem) {
  if (event.consent.marketing !== 'granted') return undefined

  const userIdentifiers = [
    ...(event.user_data?.email_sha256 ?? []).map(
      emailAddress => ({ emailAddress })
    ),
    ...(event.user_data?.phone_sha256 ?? []).map(
      phoneNumber => ({ phoneNumber })
    )
  ]

  return userIdentifiers.length > 0 ?
      { userIdentifiers }
    : undefined
}

function mapAdIdentifiers(event: CanonicalViewItem) {
  if (event.consent.marketing !== 'granted') return undefined

  const identifiers = {
    ...(event.click_id?.dclid ?
      { dclid: event.click_id.dclid }
    : {}),
    ...(event.click_id?.gbraid ?
      { gbraid: event.click_id.gbraid }
    : {}),
    ...(event.click_id?.gclid ?
      { gclid: event.click_id.gclid }
    : {}),
    ...(event.click_id?.wbraid ?
      { wbraid: event.click_id.wbraid }
    : {}),
    ...(event.impression_id ?
      { impressionId: event.impression_id }
    : {})
  }

  return Object.keys(identifiers).length > 0 ?
      identifiers
    : undefined
}

function mapDeviceInfo(event: CanonicalViewItem) {
  const source = event.event_device_info
  const deviceInfo = {
    ...(event.client_ip_address ?
      { ipAddress: event.client_ip_address }
    : {}),
    ...(source?.user_agent ?
      { userAgent: source.user_agent }
    : {}),
    ...(source?.language ?
      { languageCode: source.language }
    : {}),
    ...(source?.screen_height === undefined ?
      {}
    : { screenHeight: source.screen_height }),
    ...(source?.screen_width === undefined ?
      {}
    : { screenWidth: source.screen_width })
  }

  return Object.keys(deviceInfo).length > 0 ?
      deviceInfo
    : undefined
}

function resolveSubdivisionCode(event: CanonicalViewItem) {
  const countryCode = event.location?.country_code?.toUpperCase()
  const regionCode = event.location?.region_code?.toUpperCase()

  if (!regionCode) return undefined
  if (SUBDIVISION_CODE.test(regionCode)) return regionCode

  return countryCode && REGION_PART.test(regionCode) ?
      `${countryCode}-${regionCode}`
    : undefined
}

function mapEventLocation(event: CanonicalViewItem) {
  const location = event.location
  const subdivisionCode = resolveSubdivisionCode(event)
  const eventLocation = {
    ...(location?.city ? { city: location.city } : {}),
    ...(location?.country_code ?
      { regionCode: location.country_code.toUpperCase() }
    : {}),
    ...(subdivisionCode ?
      { subdivisionCode }
    : {})
  }

  return Object.keys(eventLocation).length > 0 ?
      eventLocation
    : undefined
}

function mapEventParameters(event: CanonicalViewItem) {
  return compactParameters([
    parameter('event_id', event.event_id),
    parameter('page_view_id', event.page_view_id),
    parameter('page_location', event.page_url),
    parameter('page_title', event.page_title),
    parameter('page_referrer', event.referrer_url),
    parameter(
      'session_id',
      event.browser_id?.ga_session_id
    )
  ])
}

export function mapCanonicalViewItemToGoogleDataManager(
  event: CanonicalViewItem
) {
  if (event.consent.analytics !== 'granted') {
    throw new Error(
      'Google Data Manager dispatch requires granted analytics consent'
    )
  }

  const marketingGranted =
    event.consent.marketing === 'granted'
  const adIdentifiers = mapAdIdentifiers(event)
  const userData = mapUserData(event)
  const eventDeviceInfo = mapDeviceInfo(event)
  const eventLocation = mapEventLocation(event)

  return DataManagerEvent.create({
    eventName: 'view_item',
    eventTimestamp: mapTimestamp(event.event_time),
    eventSource: EventSource.WEB,
    clientId: resolveClientId(event),
    ...(marketingGranted && event.external_id ?
      { userId: event.external_id }
    : {}),
    currency: event.custom_data.currency,
    conversionValue: event.custom_data.value,
    consent: mapConsent(event),
    ...(adIdentifiers ?
      { adIdentifiers }
    : {}),
    ...(userData ?
      { userData }
    : {}),
    ...(eventDeviceInfo ?
      { eventDeviceInfo }
    : {}),
    ...(eventLocation ?
      { eventLocation }
    : {}),
    additionalEventParameters: mapEventParameters(event),
    cartData: {
      items: event.custom_data.items.map(mapItem)
    }
  })
}