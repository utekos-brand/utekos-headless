// Path: types/tracking/meta/event/MetaEventPayload.ts

import type { GA4DataPayload } from 'types/tracking/google/GA4DataPayload'
import type { MetaEventData } from './MetaEventData'
import type { MetaUserData } from '../MetaUserData'
import type { MetaEventType } from './MetaEventType'

export type MetaEventPayload = {
  schemaVersion?: 1
  classification?: 'essential' | 'statistics' | 'marketing'
  source?: 'browser' | 'shopify' | 'server'
  occurredAt?: string
  canonicalEventName?:
    | 'page_view'
    | 'view_item_list'
    | 'select_item'
    | 'view_item'
    | 'add_to_cart'
    | 'view_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'purchase'
    | 'refund'
    | 'search'
    | 'generate_lead'
    | 'custom'
  eventName: MetaEventType | undefined
  eventId: string | undefined
  eventSourceUrl: string | undefined
  eventTime?: number | undefined
  actionSource: 'website' | undefined
  userData: MetaUserData | undefined
  eventData?: MetaEventData | undefined
  ga4Data?: GA4DataPayload | undefined
}
