function toFiniteNumber(value: unknown) {
  const numericValue =
    typeof value === 'number' ? value
    : typeof value === 'string' ? Number(value)
    : Number.NaN

  return Number.isFinite(numericValue) ? numericValue : undefined
}

function removeUndefinedValues(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

export function buildGA4EcommerceItems(
  eventData: Record<string, unknown> = {}
): Array<Record<string, unknown>> | undefined {
  if (Array.isArray(eventData.items)) {
    const items = eventData.items
      .map((rawItem) => {
        if (!rawItem || typeof rawItem !== 'object') {
          return null
        }

        const item = rawItem as Record<string, unknown>
        const itemId = item.item_id ?? item.id
        const itemName = item.item_name ?? item.content_name ?? item.title

        if (!itemId && !itemName) {
          return null
        }

        return removeUndefinedValues({
          ...(itemId ? { item_id: String(itemId) } : {}),
          ...(itemName ? { item_name: String(itemName) } : {}),
          item_brand: item.item_brand,
          item_category: item.item_category ?? item.content_category,
          item_variant: item.item_variant,
          item_list_id: item.item_list_id ?? eventData.item_list_id,
          item_list_name: item.item_list_name ?? eventData.item_list_name,
          index: toFiniteNumber(item.index),
          quantity: toFiniteNumber(item.quantity),
          price: toFiniteNumber(item.price ?? item.item_price)
        })
      })
      .filter((item): item is Record<string, unknown> => Boolean(item))

    return items.length > 0 ? items : undefined
  }

  if (Array.isArray(eventData.contents)) {
    const items = eventData.contents
      .map((content, index) => {
        const item = content as Record<string, unknown>
        const itemId = item.item_id ?? item.id

        if (!itemId) {
          return null
        }

        return removeUndefinedValues({
          item_id: String(itemId),
          item_name: item.item_name ?? item.content_name ?? item.title ?? eventData.content_name,
          item_brand: item.item_brand ?? eventData.item_brand,
          item_category: item.item_category ?? item.content_category,
          item_variant: item.item_variant,
          item_list_id: item.item_list_id ?? eventData.item_list_id,
          item_list_name: item.item_list_name ?? eventData.item_list_name,
          index: toFiniteNumber(item.index) ?? index,
          quantity: toFiniteNumber(item.quantity),
          price: toFiniteNumber(item.price ?? item.item_price)
        })
      })
      .filter((item): item is Record<string, unknown> => Boolean(item))

    return items.length > 0 ? items : undefined
  }

  if (Array.isArray(eventData.content_ids)) {
    const items = eventData.content_ids.map((id, index) =>
      removeUndefinedValues({
        item_id: String(id),
        item_name: eventData.content_name,
        item_brand: eventData.item_brand,
        item_category: eventData.content_category,
        item_list_id: eventData.item_list_id,
        item_list_name: eventData.item_list_name,
        index
      })
    )

    return items.length > 0 ? items : undefined
  }

  return undefined
}
