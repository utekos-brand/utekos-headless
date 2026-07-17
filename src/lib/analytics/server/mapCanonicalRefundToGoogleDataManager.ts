import { protos } from '@google-ads/datamanager'
import type { CanonicalRefund } from '../refundEvent'
import {
  compactGoogleDataManagerParameters,
  googleDataManagerIdentifierParameter,
  googleDataManagerParameter,
  limitGooglePageLocation,
  mapGoogleDataManagerAdIdentifiers,
  mapGoogleDataManagerConsent,
  mapGoogleDataManagerDeviceInfo,
  mapGoogleDataManagerEventLocation,
  mapGoogleDataManagerTimestamp,
  mapGoogleDataManagerUserData,
  normalizeGoogleReferrerUrl,
  resolveGoogleClientId
} from './googleDataManagerSharedMapping'

type DataManagerItem =
  protos.google.ads.datamanager.v1.IItem

const MAX_ADDITIONAL_ITEM_PARAMETERS = 24
const {
  Event: DataManagerEvent,
  EventSource
} = protos.google.ads.datamanager.v1

function mapRefundItem(
  item: CanonicalRefund['custom_data']['items'][number]
): DataManagerItem {
  const additionalItemParameters = compactGoogleDataManagerParameters([
    googleDataManagerParameter('item_name', item.item_name),
    googleDataManagerIdentifierParameter('sku', item.sku)
  ]).slice(0, MAX_ADDITIONAL_ITEM_PARAMETERS)

  return {
    itemId: item.item_id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    additionalItemParameters
  }
}

function mapRefundEventParameters(event: CanonicalRefund) {
  return compactGoogleDataManagerParameters([
    googleDataManagerIdentifierParameter('event_id', event.event_id),
    googleDataManagerIdentifierParameter(
      'transaction_id',
      event.custom_data.transaction_id
    ),
    googleDataManagerIdentifierParameter(
      'refund_id',
      event.custom_data.refund_id
    ),
    googleDataManagerParameter(
      'page_location',
      event.page_url ?
        limitGooglePageLocation(event.page_url)
      : undefined
    ),
    googleDataManagerParameter(
      'page_referrer',
      normalizeGoogleReferrerUrl(event.referrer_url)
    ),
    googleDataManagerParameter(
      'session_id',
      event.browser_id?.ga_session_id
    )
  ])
}

export function mapCanonicalRefundToGoogleDataManager(
  event: CanonicalRefund
) {
  if (event.consent.analytics !== 'granted') {
    throw new Error(
      'Google Data Manager dispatch requires granted analytics consent'
    )
  }

  const marketingGranted = event.consent.marketing === 'granted'
  const adIdentifiers = mapGoogleDataManagerAdIdentifiers(event)
  const userData = mapGoogleDataManagerUserData(event)
  const eventDeviceInfo = mapGoogleDataManagerDeviceInfo(event)
  const eventLocation = mapGoogleDataManagerEventLocation(event)

  return DataManagerEvent.create({
    eventName: 'refund',
    transactionId: event.custom_data.transaction_id,
    eventTimestamp: mapGoogleDataManagerTimestamp(event.event_time),
    eventSource: EventSource.WEB,
    clientId: resolveGoogleClientId(event.browser_id),
    ...(marketingGranted && event.external_id ?
      { userId: event.external_id }
    : {}),
    currency: event.custom_data.currency,
    conversionValue: event.custom_data.value,
    consent: mapGoogleDataManagerConsent(event.consent),
    ...(adIdentifiers ? { adIdentifiers } : {}),
    ...(userData ? { userData } : {}),
    ...(eventDeviceInfo ? { eventDeviceInfo } : {}),
    ...(eventLocation ? { eventLocation } : {}),
    additionalEventParameters: mapRefundEventParameters(event),
    cartData: {
      items: event.custom_data.items.map(mapRefundItem)
    }
  })
}
