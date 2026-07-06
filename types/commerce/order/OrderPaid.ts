// Path: types/order-paid.types.ts
// Based on Shopify Order Paid Webhook payload structure

import type { Address } from 'types/commerce/customer/Address'
import type { Customer } from 'types/commerce/customer/Customer'
import type { DiscountApplication } from 'types/commerce/order/Discount'
import type { Fulfillment } from 'types/commerce/order/Fulfillment'
import type { LineItem } from 'types/commerce/order/LineItem'
import type { PaymentTerms } from 'types/commerce/order/PaymentTerms'
import type { Refund } from 'types/commerce/order/Refund'
import type { ShippingLine } from 'types/commerce/order/ShippingLine'
import type { Return } from 'types/commerce/order/Return'
import type { LineItemGroup } from 'types/commerce/order/LineItem'
import type { MoneySet } from 'types/commerce/MoneySet'
import type { TaxLine } from 'types/commerce/order/TaxLine'
export type OrderPaid = {
  id: number
  admin_graphql_api_id: string
  app_id: number | null
  browser_ip: string | null
  buyer_accepts_marketing: boolean
  cancel_reason: string | null
  cancelled_at: string | null
  cart_token: string | null
  checkout_id: number | null
  checkout_token: string | null
  client_details: Record<string, unknown> | null
  closed_at: string | null
  confirmation_number: string | null
  confirmed: boolean
  contact_email: string | null
  created_at: string
  currency: string
  current_shipping_price_set: MoneySet
  current_subtotal_price: string
  current_subtotal_price_set: MoneySet
  current_total_additional_fees_set: MoneySet | null
  current_total_discounts: string
  current_total_discounts_set: MoneySet
  current_total_duties_set: MoneySet | null
  current_total_price: string
  current_total_price_set: MoneySet
  current_total_tax: string
  current_total_tax_set: MoneySet
  customer_locale: string
  device_id: number | null
  discount_codes: Array<{ code: string; amount: string; type: string }> | null
  duties_included: boolean
  email: string | null
  estimated_taxes: boolean
  financial_status: string | null
  fulfillment_status: string | null
  landing_site: string | null
  landing_site_ref: string | null
  location_id: number | null
  merchant_business_entity_id: string
  merchant_of_record_app_id: number | null
  name: string | null
  note: string | null
  note_attributes: Array<{ name: string; value: string }>
  number: number
  order_number: number
  order_status_url: string | null
  original_total_additional_fees_set: MoneySet | null
  original_total_duties_set: MoneySet | null
  payment_gateway_names: string[]
  phone: string | null
  po_number: string | null
  presentment_currency: string
  processed_at: string | null
  reference: string | null
  referring_site: string | null
  source_identifier: string | null
  source_name: string
  source_url: string | null
  subtotal_price: string
  subtotal_price_set: MoneySet
  tags: string
  tax_exempt: boolean
  tax_lines: TaxLine[]
  taxes_included: boolean
  test: boolean
  token: string | null
  total_cash_rounding_payment_adjustment_set: MoneySet
  total_cash_rounding_refund_adjustment_set: MoneySet
  total_discounts: string
  total_discounts_set: MoneySet
  total_line_items_price: string
  total_line_items_price_set: MoneySet
  total_outstanding: string
  total_price: string
  total_price_set: MoneySet
  total_shipping_price_set: MoneySet
  total_tax: string
  total_tax_set: MoneySet
  total_tip_received: string
  total_weight: number
  updated_at: string
  user_id: number | null
  billing_address: Address | null
  customer: Customer | null
  discount_applications: DiscountApplication[]
  fulfillments: Fulfillment[]
  line_items: LineItem[]
  payment_terms: PaymentTerms | null
  refunds: Refund[]
  shipping_address: Address | null
  shipping_lines: ShippingLine[]
  returns: Return[]
  line_item_groups: LineItemGroup[]
}


