import { buildGA4EcommerceItems } from './buildGA4EcommerceItems'

function toFiniteNumber(value: unknown) {
  const numericValue =
    typeof value === 'number' ? value
    : typeof value === 'string' ? Number(value)
    : Number.NaN

  return Number.isFinite(numericValue) ? numericValue : undefined
}

function addStringParam(
  params: Record<string, unknown>,
  key: string,
  value: unknown
) {
  if (typeof value === 'string' && value.trim()) {
    params[key] = value.trim()
  }
}

export function buildGA4EventParams(
  eventData: Record<string, unknown> = {}
): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  const value = toFiniteNumber(eventData.value)
  const tax = toFiniteNumber(eventData.tax)
  const shipping = toFiniteNumber(eventData.shipping)
  const items = buildGA4EcommerceItems(eventData)

  if (value !== undefined) {
    params.value = value
  }

  if (tax !== undefined) {
    params.tax = tax
  }

  if (shipping !== undefined) {
    params.shipping = shipping
  }

  addStringParam(params, 'transaction_id', eventData.transaction_id)
  addStringParam(params, 'currency', eventData.currency)
  addStringParam(params, 'coupon', eventData.coupon)
  addStringParam(params, 'page_location', eventData.page_location ?? eventData.url)
  addStringParam(params, 'page_title', eventData.page_title ?? eventData.title)
  addStringParam(params, 'search_term', eventData.search_term ?? eventData.search_string)
  addStringParam(params, 'item_list_id', eventData.item_list_id)
  addStringParam(params, 'item_list_name', eventData.item_list_name)

  if (items) {
    params.items = items
  }

  return params
}
