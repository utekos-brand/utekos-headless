import { z } from 'zod'

const consentValueSchema = z.enum(['denied', 'granted'])

const consentSnapshotSchema = z.strictObject({
  analytics: consentValueSchema,
  marketing: consentValueSchema,
  preferences: consentValueSchema,
  source: z.literal('cookiebot'),
  version: z.string().min(1)
})

const eventDeviceInfoSchema = z.strictObject({
  language: z.string().min(1).optional(),
  pixel_ratio: z.number().positive().optional(),
  platform: z.string().min(1).optional(),
  screen_height: z.number().int().positive().optional(),
  screen_width: z.number().int().positive().optional(),
  user_agent: z.string().min(1).optional(),
  viewport_height: z.number().int().positive().optional(),
  viewport_width: z.number().int().positive().optional()
})

const identifierMapSchema = z.record(
  z.string().min(1),
  z.string().min(1)
)

const userDataSchema = z.strictObject({
  email_sha256: z.array(z.string().regex(/^[a-f0-9]{64}$/)).optional(),
  phone_sha256: z.array(z.string().regex(/^[a-f0-9]{64}$/)).optional()
})

const locationSchema = z.strictObject({
  city: z.string().min(1).optional(),
  country_code: z.string().length(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  postal_code: z.string().min(1).optional(),
  region_code: z.string().min(1).optional(),
  source: z.enum(['browser_permission', 'server_request']).optional()
})

export const canonicalPageViewSchema = z.strictObject({
  schema_version: z.literal(1),
  event_name: z.literal('page_view'),
  event_id: z.string().uuid(),
  page_view_id: z.string().uuid(),
  event_time: z.string().datetime({ offset: true }),
  source: z.literal('web'),
  environment: z.enum(['development', 'preview', 'production', 'test']),
  page_url: z.string().url(),
  referrer_url: z.string().url().optional(),
  page_title: z.string().min(1),
  consent: consentSnapshotSchema,
  user_data: userDataSchema.optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  click_id: identifierMapSchema.optional(),
  external_id: z.string().min(1).optional(),
  browser_id: identifierMapSchema.optional(),
  client_ip_address: z.string().min(1).optional(),
  event_device_info: eventDeviceInfoSchema.optional(),
  region_code: z.string().min(1).optional(),
  impression_id: z.string().min(1).optional(),
  location: locationSchema.optional()
})

export type ConsentSnapshot = z.infer<typeof consentSnapshotSchema>
export type CanonicalPageView = z.infer<typeof canonicalPageViewSchema>
export type TrackingEnvironment = CanonicalPageView['environment']

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

type CreateCanonicalPageViewInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  environment: CanonicalPageView['environment']
  eventId: string
  impressionId?: string
  pageViewId: string
  eventTime: string
  pageUrl: string
  referrerUrl?: string
  pageTitle: string
  consent: ConsentSnapshot
  eventDeviceInfo?: EventDeviceInfoInput
}

export type PageViewDataLayerEvent = {
  event: 'page_view'
  event_id: string
  event_time: string
  page_view_id: string
  page_location: string
  page_referrer?: string
  page_title: string
  source: 'web'
  canonical_event: CanonicalPageView
}

type PageViewNavigationInput = {
  currentUrl: string
  documentReferrer: string
  previousUrl: string | null
}

type PageViewNavigation = {
  pageUrl: string
  referrerUrl?: string
}

function mapEventDeviceInfo(input: EventDeviceInfoInput | undefined) {
  if (!input) return undefined

  return {
    ...(input.language ? { language: input.language } : {}),
    ...(input.pixelRatio === undefined ? {} : { pixel_ratio: input.pixelRatio }),
    ...(input.platform ? { platform: input.platform } : {}),
    ...(input.screenHeight === undefined ? {} : { screen_height: input.screenHeight }),
    ...(input.screenWidth === undefined ? {} : { screen_width: input.screenWidth }),
    ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    ...(input.viewportHeight === undefined ? {} : { viewport_height: input.viewportHeight }),
    ...(input.viewportWidth === undefined ? {} : { viewport_width: input.viewportWidth })
  }
}

export function createCanonicalPageView(
  input: CreateCanonicalPageViewInput
): CanonicalPageView {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalPageViewSchema.parse({
    schema_version: 1,
    event_name: 'page_view',
    event_id: input.eventId,
    page_view_id: input.pageViewId,
    event_time: input.eventTime,
    source: 'web',
    environment: input.environment,
    page_url: input.pageUrl,
    ...(input.referrerUrl ? { referrer_url: input.referrerUrl } : {}),
    page_title: input.pageTitle,
    consent: input.consent,
    ...(input.browserId ? { browser_id: input.browserId } : {}),
    ...(input.clickId ? { click_id: input.clickId } : {}),
    ...(input.impressionId ? { impression_id: input.impressionId } : {}),
    ...(eventDeviceInfo ? { event_device_info: eventDeviceInfo } : {})
  })
}

export function buildPageViewDataLayerEvent(
  event: CanonicalPageView
): PageViewDataLayerEvent {
  return {
    event: 'page_view',
    event_id: event.event_id,
    event_time: event.event_time,
    page_view_id: event.page_view_id,
    page_location: event.page_url,
    ...(event.referrer_url ? { page_referrer: event.referrer_url } : {}),
    page_title: event.page_title,
    source: event.source,
    canonical_event: event
  }
}

export function resolvePageViewNavigation(
  input: PageViewNavigationInput
): PageViewNavigation | null {
  if (input.currentUrl === input.previousUrl) return null

  const referrerUrl = input.previousUrl || input.documentReferrer

  return {
    pageUrl: input.currentUrl,
    ...(referrerUrl ? { referrerUrl } : {})
  }
}
