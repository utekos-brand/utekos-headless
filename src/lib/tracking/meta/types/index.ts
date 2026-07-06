import type { MetaEventData, MetaEventType } from 'types/tracking/meta/event'
import type { MetaUserData } from 'types/tracking/meta'
import type { GA4DataPayload } from 'types/tracking/google/GA4DataPayload'

export type DispatchMetaTrackingEventInput = {
  eventName: MetaEventType
  eventId: string
  eventData?: MetaEventData
  eventSourceUrl?: string
  eventTime?: number
  userData?: Partial<MetaUserData>
  ga4Data?: GA4DataPayload
  sendBrowserEvent?: boolean
}

export type MetaApiError = Error & {
  response?: {
    data?: {
      error?: {
        code?: number
        error_subcode?: number
        fbtrace_id?: string
        message?: string
        type?: string
      }
    }
  }
}

export type MetaCatalogAvailability = 'in stock' | 'out of stock'
export type MetaCatalogCondition = 'new'
export type MetaCatalogAgeGroup = 'adult'
export type MetaCatalogGender = 'unisex'
