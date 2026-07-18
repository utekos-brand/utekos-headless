import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import { parseOrderAttributionFromNoteAttributes } from '../checkoutAttributionSnapshot'
import {
  canonicalPurchaseSchema,
  deterministicPurchaseEventId,
  shopifyPurchaseTransactionId,
  type CanonicalPurchase
} from '../purchaseEvent'
import { hashCustomerMatchIdentifier } from '@/lib/google/data-manager/hashCustomerMatchIdentifier'
import { normalizeCustomerMatchEmail } from '@/lib/google/data-manager/normalizeCustomerMatchEmail'
import { normalizeCustomerMatchPhone } from '@/lib/google/data-manager/normalizeCustomerMatchPhone'
import { parseAbsoluteHttpUrl } from './parseAbsoluteHttpUrl'
import { resolveCanonicalEnvironment } from './resolveCanonicalEnvironment'

function parseDecimal(
  value: string | number | null | undefined
) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function hashEmail(email: string | null | undefined) {
  if (!email) return undefined

  const normalized = normalizeCustomerMatchEmail(email)
  return normalized ?
      hashCustomerMatchIdentifier(normalized)
    : undefined
}

function hashPhone(phone: string | null | undefined) {
  if (!phone) return undefined

  const normalized = normalizeCustomerMatchPhone(phone)
  return normalized ?
      hashCustomerMatchIdentifier(normalized)
    : undefined
}

function readClientUserAgent(order: OrderPaid) {
  const clientDetails = order.client_details

  if (
    typeof clientDetails === 'object' &&
    clientDetails !== null &&
    typeof clientDetails.user_agent === 'string' &&
    clientDetails.user_agent.length > 0
  ) {
    return clientDetails.user_agent
  }

  return undefined
}

function mapPurchaseItems(order: OrderPaid) {
  return order.line_items
    .map(lineItem => {
      const itemId =
        lineItem.variant_id !== null ?
          String(lineItem.variant_id)
        : String(lineItem.id)

      return {
        item_id: itemId,
        item_name: lineItem.name || lineItem.title,
        quantity: lineItem.quantity,
        unit_price: parseDecimal(lineItem.price),
        ...(lineItem.sku ? { sku: lineItem.sku } : {})
      }
    })
    .filter(item => item.quantity > 0)
}

function mapOrderLocation(order: OrderPaid) {
  const address = order.shipping_address ?? order.billing_address
  if (!address) return undefined

  const location = {
    ...(address.city ? { city: address.city } : {}),
    ...(address.country_code ?
      { country_code: address.country_code.toUpperCase() }
    : {}),
    ...(address.zip ? { postal_code: address.zip } : {}),
    ...(address.province_code ?
      { region_code: address.province_code }
    : {})
  }

  return Object.keys(location).length > 0 ?
      { ...location, source: 'server_request' as const }
    : undefined
}

export function shopifyOrderToCanonicalPurchase(
  order: OrderPaid
): CanonicalPurchase {
  const orderLegacyId = String(order.id)
  const email =
    order.email ?? order.contact_email ?? order.customer?.email
  const phone = order.phone ?? order.customer?.phone
  const emailHash = hashEmail(email)
  const phoneHash = hashPhone(phone)
  const userAgent = readClientUserAgent(order)
  const attribution = parseOrderAttributionFromNoteAttributes(
    order.note_attributes
  )
  const pageUrl =
    attribution.page_url ??
    parseAbsoluteHttpUrl(order.landing_site) ??
    parseAbsoluteHttpUrl(order.order_status_url)
  const referrerUrl =
    attribution.referrer_url ??
    parseAbsoluteHttpUrl(order.referring_site)
  const location =
    attribution.consent.marketing === 'granted' ?
      mapOrderLocation(order)
    : undefined
  const items = mapPurchaseItems(order)

  if (items.length === 0) {
    throw new Error(
      'Shopify order purchase mapping requires at least one line item'
    )
  }

  const userData = {
    ...(emailHash ? { email_sha256: [emailHash] } : {}),
    ...(phoneHash ? { phone_sha256: [phoneHash] } : {})
  }

  return canonicalPurchaseSchema.parse({
    schema_version: 1,
    event_name: 'purchase',
    event_id: deterministicPurchaseEventId(orderLegacyId),
    event_time: order.processed_at ?? order.created_at,
    source: 'webhook',
    environment: resolveCanonicalEnvironment(),
    ...(pageUrl ? { page_url: pageUrl } : {}),
    ...(referrerUrl ? { referrer_url: referrerUrl } : {}),
    consent: attribution.consent,
    ...(attribution.browser_id ?
      { browser_id: attribution.browser_id }
    : {}),
    ...(attribution.click_id ?
      { click_id: attribution.click_id }
    : {}),
    ...(attribution.external_id ?
      { external_id: attribution.external_id }
    : order.customer?.id ?
      { external_id: `shopify_customer_${order.customer.id}` }
    : {}),
    ...(order.browser_ip ?
      { client_ip_address: order.browser_ip }
    : {}),
    ...(userAgent ?
      { event_device_info: { user_agent: userAgent } }
    : {}),
    ...(location ? { location } : {}),
    ...(Object.keys(userData).length > 0 ?
      { user_data: userData }
    : {}),
    custom_data: {
      currency: (
        order.presentment_currency || order.currency
      ).toUpperCase(),
      value: parseDecimal(order.total_price),
      tax_value: parseDecimal(order.total_tax),
      shipping_value: parseDecimal(
        order.total_shipping_price_set?.shop_money?.amount
      ),
      transaction_id:
        shopifyPurchaseTransactionId(orderLegacyId),
      order_name: order.name ?? String(order.order_number),
      items
    }
  })
}
