// Path: types/analytics/AnalyticsEvent.ts
import type { CurrencyCode } from 'types/commerce/CurrencyCode'
import type { AnalyticsItem } from './AnalyticsItem'
export type AnalyticsEvent = {
  name: string
  params?: Record<string, any>
  ecommerce?: {
    currency: CurrencyCode
    value: number
    transaction_id?: string
    coupon?: string
    shipping?: number
    tax?: number
    items: AnalyticsItem[]
    customer_type?: 'new' | 'returning'
  }
}
