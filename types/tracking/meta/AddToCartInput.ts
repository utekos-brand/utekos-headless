// Path: types/tracking/meta/AddToCartInput.ts
import type { AddToCartContent } from './AddToCartContent'
export type AddToCartInput = {
  value?: number | undefined
  currency?: string | undefined
  contents: AddToCartContent[]
  content_type?: 'product' | 'product_group' | undefined
  content_ids?: string[] | undefined
  eventId?: string | undefined
  sourceUrl?: string | undefined
  eventName?: string | undefined
  userData: {
    fbp?: string | undefined
    fbc?: string | undefined
    client_user_agent?: string | undefined
    client_ip_address?: string | undefined
    external_id?: string | undefined
  }
  occuredAt?: number | undefined
}
