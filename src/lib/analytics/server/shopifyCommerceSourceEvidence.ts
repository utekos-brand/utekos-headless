import { z } from 'zod'
import {
  canonicalEventSourceEvidenceSchema,
  type CanonicalEventSourceEvidence
} from './canonicalEventSourceEvidence'

type ShopifyPurchaseSourceEvent = {
  custom_data: { transaction_id: string }
  event_id: string
  event_name: 'purchase'
  event_time: string
}

type ShopifyRefundSourceEvent = {
  custom_data: { refund_id: string; transaction_id: string }
  event_id: string
  event_name: 'refund'
  event_time: string
}

export type ShopifyCommerceSourceEvent =
  | ShopifyPurchaseSourceEvent
  | ShopifyRefundSourceEvent

const shopifyLegacyIdSchema = z.string().regex(/^\d+$/)
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

function resolveShopifySourceIdentity(
  event: ShopifyCommerceSourceEvent
) {
  if (event.event_name === 'purchase') {
    const match = /^shopify_order_(\d+)$/.exec(
      event.custom_data.transaction_id
    )

    return {
      sourceObjectId: shopifyLegacyIdSchema.parse(match?.[1]),
      sourceObjectType: 'order',
      sourceTopic: 'orders/paid'
    } as const
  }

  const match = /^shopify_refund_(\d+)$/.exec(
    event.custom_data.refund_id
  )

  return {
    sourceObjectId: shopifyLegacyIdSchema.parse(match?.[1]),
    sourceObjectType: 'refund',
    sourceTopic: 'refunds/create'
  } as const
}

export function createShopifyWebhookCommerceSourceEvidence(input: {
  event: ShopifyCommerceSourceEvent
  headers: Headers
  observedAt: Date
}): CanonicalEventSourceEvidence {
  const identity = resolveShopifySourceIdentity(input.event)
  const metadata = z
    .strictObject({
      apiVersion: shopifyApiVersionSchema,
      deliveryId: webhookMetadataValueSchema,
      eventId: webhookMetadataValueSchema,
      topic: z.literal(identity.sourceTopic),
      triggeredAt: shopifyTriggeredAtSchema
    })
    .parse({
      apiVersion: input.headers.get('x-shopify-api-version'),
      deliveryId: input.headers.get('x-shopify-webhook-id'),
      eventId: input.headers.get('x-shopify-event-id'),
      topic: input.headers.get('x-shopify-topic'),
      triggeredAt: input.headers.get('x-shopify-triggered-at')
    })

  return canonicalEventSourceEvidenceSchema.parse({
    canonical_event_id: input.event.event_id,
    source_system: 'shopify',
    source_method: 'webhook',
    source_object_type: identity.sourceObjectType,
    source_object_id: identity.sourceObjectId,
    source_topic: identity.sourceTopic,
    source_delivery_id: metadata.deliveryId,
    source_event_id: metadata.eventId,
    source_api_version: metadata.apiVersion,
    source_triggered_at: metadata.triggeredAt,
    source_observed_at: observedAtSchema
      .parse(input.observedAt)
      .toISOString()
  })
}

export function createShopifyReconciliationCommerceSourceEvidence(input: {
  apiVersion: string
  event: ShopifyCommerceSourceEvent
  observedAt: Date
}): CanonicalEventSourceEvidence {
  const identity = resolveShopifySourceIdentity(input.event)

  return canonicalEventSourceEvidenceSchema.parse({
    canonical_event_id: input.event.event_id,
    source_system: 'shopify',
    source_method: 'reconciliation',
    source_object_type: identity.sourceObjectType,
    source_object_id: identity.sourceObjectId,
    source_topic: identity.sourceTopic,
    source_delivery_id: null,
    source_event_id: null,
    source_api_version: shopifyApiVersionSchema.parse(
      input.apiVersion
    ),
    source_triggered_at: input.event.event_time,
    source_observed_at: observedAtSchema
      .parse(input.observedAt)
      .toISOString()
  })
}
