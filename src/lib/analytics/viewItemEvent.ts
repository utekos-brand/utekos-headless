import { z } from 'zod'
import {
  canonicalEventEnvelopeSchema,
  type CanonicalEventEnvelope,
  type ConsentSnapshot
} from './canonicalEventEnvelope'

const selectedOptionSchema = z.strictObject({
  name: z.string().min(1),
  value: z.string().min(1)
})

const canonicalCommerceItemSchema = z.strictObject({
  item_id: z.string().min(1),
  product_id: z.string().min(1),
  variant_id: z.string().min(1),
  item_name: z.string().min(1),
  item_brand: z.string().min(1).optional(),
  item_variant: z.string().min(1).optional(),
  item_category: z.string().min(1).optional(),
  item_category2: z.string().min(1).optional(),
  item_category3: z.string().min(1).optional(),
  item_category4: z.string().min(1).optional(),
  item_category5: z.string().min(1).optional(),
  product_handle: z.string().min(1),
  product_type: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  gtin: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().finite().nonnegative(),
  gross_unit_price: z.number().finite().nonnegative(),
  compare_at_unit_price: z
    .number()
    .finite()
    .nonnegative()
    .optional(),
  gross_compare_at_unit_price: z
    .number()
    .finite()
    .nonnegative()
    .optional(),
  discount: z.number().finite().nonnegative().optional(),
  gross_discount: z.number().finite().nonnegative().optional(),
  tax_amount: z.number().finite().nonnegative(),
  tax_rate: z.number().finite().min(0).max(1),
  taxable: z.boolean(),
  price_includes_tax: z.boolean(),
  available_for_sale: z.boolean(),
  currently_not_in_stock: z.boolean(),
  quantity_available: z.number().int().nonnegative().nullable(),
  selected_options: z.array(selectedOptionSchema),
  collection_ids: z.array(z.string().min(1)),
  collection_titles: z.array(z.string().min(1))
})

export const canonicalViewItemCommerceSchema = z.strictObject({
  currency: z.string().regex(/^[A-Z]{3}$/),
  value: z.number().finite().nonnegative(),
  gross_value: z.number().finite().nonnegative(),
  tax_value: z.number().finite().nonnegative(),
  items: z.array(canonicalCommerceItemSchema).min(1)
})

export const canonicalViewItemSchema =
  canonicalEventEnvelopeSchema.extend({
    event_name: z.literal('view_item'),
    source: z.literal('web'),
    page_view_id: z.string().uuid(),
    page_url: z.string().url(),
    referrer_url: z.string().url().optional(),
    page_title: z.string().min(1),
    custom_data: canonicalViewItemCommerceSchema
  })

export type CanonicalViewItemCommerce = z.infer<
  typeof canonicalViewItemCommerceSchema
>

export type CanonicalViewItem = z.infer<
  typeof canonicalViewItemSchema
>

type EventDeviceInfoInput = {
  language?: string
  pixelRatio?: number
  platform?: string
  screenHeight?: number
  screenWidth?: number
  userAgent?: string
  viewportHeight?: number
  viewportWidth?: number
}

type UserDataInput = {
  emailSha256?: string[]
  phoneSha256?: string[]
}

type CreateCanonicalViewItemInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  commerce: CanonicalViewItemCommerce
  consent: ConsentSnapshot
  environment: CanonicalEventEnvelope['environment']
  eventDeviceInfo?: EventDeviceInfoInput
  eventId: string
  eventTime: string
  externalId?: string
  impressionId?: string
  location?: NonNullable<CanonicalEventEnvelope['location']>
  pageTitle: string
  pageUrl: string
  pageViewId: string
  referrerUrl?: string
  userData?: UserDataInput
}

export type ViewItemDataLayerEvent = {
  event: 'view_item'
  event_id: string
  event_time: string
  page_view_id: string
  source: 'web'
  transaction_id: string
  commerce: CanonicalViewItemCommerce
  canonical_event: CanonicalViewItem
}

export function createCanonicalViewItem(
  input: CreateCanonicalViewItemInput
): CanonicalViewItem {
  const eventDeviceInfo = mapEventDeviceInfo(
    input.eventDeviceInfo
  )
  const userData = mapUserData(input.userData)

  return canonicalViewItemSchema.parse({
    schema_version: 1,
    event_name: 'view_item',
    event_id: input.eventId,
    page_view_id: input.pageViewId,
    event_time: input.eventTime,
    source: 'web',
    environment: input.environment,
    page_url: input.pageUrl,
    ...(input.referrerUrl ?
      { referrer_url: input.referrerUrl }
    : {}),
    page_title: input.pageTitle,
    consent: input.consent,
    custom_data: input.commerce,
    ...(input.browserId ? { browser_id: input.browserId } : {}),
    ...(input.clickId ? { click_id: input.clickId } : {}),
    ...(input.externalId ?
      { external_id: input.externalId }
    : {}),
    ...(input.impressionId ?
      { impression_id: input.impressionId }
    : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(eventDeviceInfo ?
      { event_device_info: eventDeviceInfo }
    : {}),
    ...(userData ? { user_data: userData } : {})
  })
}

export function buildViewItemDataLayerEvent(
  event: CanonicalViewItem
): ViewItemDataLayerEvent {
  return {
    event: 'view_item',
    event_id: event.event_id,
    event_time: event.event_time,
    page_view_id: event.page_view_id,
    source: event.source,
    transaction_id: event.event_id,
    commerce: event.custom_data,
    canonical_event: event
  }
}

function mapEventDeviceInfo(
  input: EventDeviceInfoInput | undefined
) {
  if (!input) return undefined

  const deviceInfo = {
    ...(input.language ? { language: input.language } : {}),
    ...(input.pixelRatio === undefined ?
      {}
    : { pixel_ratio: input.pixelRatio }),
    ...(input.platform ? { platform: input.platform } : {}),
    ...(input.screenHeight === undefined ?
      {}
    : { screen_height: input.screenHeight }),
    ...(input.screenWidth === undefined ?
      {}
    : { screen_width: input.screenWidth }),
    ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    ...(input.viewportHeight === undefined ?
      {}
    : { viewport_height: input.viewportHeight }),
    ...(input.viewportWidth === undefined ?
      {}
    : { viewport_width: input.viewportWidth })
  }

  return Object.keys(deviceInfo).length > 0 ?
      deviceInfo
    : undefined
}

function mapUserData(input: UserDataInput | undefined) {
  if (!input) return undefined

  const userData = {
    ...(input.emailSha256 ?
      { email_sha256: input.emailSha256 }
    : {}),
    ...(input.phoneSha256 ?
      { phone_sha256: input.phoneSha256 }
    : {})
  }

  return Object.keys(userData).length > 0 ? userData : undefined
}
