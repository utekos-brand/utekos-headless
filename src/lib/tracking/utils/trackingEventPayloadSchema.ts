import { z } from 'zod'

const flexibleObjectSchema = z.record(z.string(), z.unknown())
const trackingEventNameSchema = z.enum([
  'PageView',
  'ViewContent',
  'ViewCategory',
  'ViewItemList',
  'SelectItem',
  'AddToCart',
  'ViewCart',
  'RemoveFromCart',
  'InitiateCheckout',
  'Purchase',
  'Lead',
  'Search',
  'CompleteRegistration',
  'HeroInteract',
  'InteractWithAccordion',
  'OpenQuickView',
  'LandingCTAClick',
  'LandingSectionView',
  'LandingScrollDepth'
])

export const trackingEventPayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    classification: z.enum(['essential', 'statistics', 'marketing']),
    source: z.enum(['browser', 'shopify', 'server']),
    occurredAt: z.string().datetime(),
    canonicalEventName: z.enum([
      'page_view',
      'view_item_list',
      'select_item',
      'view_item',
      'add_to_cart',
      'view_cart',
      'remove_from_cart',
      'begin_checkout',
      'purchase',
      'search',
      'generate_lead',
      'custom'
    ]),
    eventName: trackingEventNameSchema,
    eventId: z.string().min(1),
    eventSourceUrl: z.string().optional(),
    eventTime: z.number().int().positive().optional(),
    actionSource: z.literal('website').optional(),
    userData: flexibleObjectSchema.optional(),
    eventData: flexibleObjectSchema.optional(),
    ga4Data: z
      .object({
        client_id: z.string().optional(),
        session_id: z.union([z.string(), z.number()]).optional(),
        items: z.array(z.unknown()).optional(),
        value: z.number().optional(),
        currency: z.string().optional()
      })
      .optional()
  })
  .strict()
