import { z } from 'zod'
import {
  canonicalEventSourceEvidenceSchema,
  type CanonicalEventSourceEvidence
} from './canonicalEventSourceEvidence'
import {
  SHOPIFY_CARTS_UPDATE_API_VERSION,
  SHOPIFY_CARTS_UPDATE_TOPIC
} from './shopifyCartsUpdateWebhookPayload'

const webhookMetadataValueSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
const shopifyApiVersionSchema = z
  .string()
  .trim()
  .regex(/^(?:\d{4}-\d{2}|unstable)$/)
const shopifyTriggeredAtSchema = z
  .string()
  .datetime({ offset: true })
  .transform(value => new Date(value).toISOString())
const observedAtSchema = z
  .date()
  .refine(
    value => Number.isFinite(value.getTime()),
    'invalid_source_observed_at'
  )

export function createShopifyCartWebhookSourceEvidence(input: {
  cartToken: string
  eventId: string
  headers: Headers
  observedAt: Date
}): CanonicalEventSourceEvidence {
  const metadata = z
    .strictObject({
      apiVersion: shopifyApiVersionSchema,
      deliveryId: webhookMetadataValueSchema,
      eventId: webhookMetadataValueSchema,
      topic: z.literal(SHOPIFY_CARTS_UPDATE_TOPIC),
      triggeredAt: shopifyTriggeredAtSchema
    })
    .parse({
      apiVersion:
        input.headers.get('x-shopify-api-version') ??
        SHOPIFY_CARTS_UPDATE_API_VERSION,
      deliveryId: input.headers.get('x-shopify-webhook-id'),
      eventId: input.headers.get('x-shopify-event-id'),
      topic: input.headers.get('x-shopify-topic'),
      triggeredAt: input.headers.get('x-shopify-triggered-at')
    })

  return canonicalEventSourceEvidenceSchema.parse({
    canonical_event_id: input.eventId,
    source_system: 'shopify',
    source_method: 'webhook',
    source_object_type: 'cart',
    source_object_id: input.cartToken.slice(0, 255),
    source_topic: SHOPIFY_CARTS_UPDATE_TOPIC,
    source_delivery_id: metadata.deliveryId,
    source_event_id: metadata.eventId,
    source_api_version: metadata.apiVersion,
    source_triggered_at: metadata.triggeredAt,
    source_observed_at: observedAtSchema
      .parse(input.observedAt)
      .toISOString()
  })
}
