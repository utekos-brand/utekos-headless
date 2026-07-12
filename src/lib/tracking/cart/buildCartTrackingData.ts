import type { Cart, CartLine } from 'types/cart'
import type { MetaEventData } from 'types/tracking/meta/event'

export function shouldTrackCartDrawerView({
  open,
  hasCart,
  trackedForCurrentOpen
}: {
  open: boolean
  hasCart: boolean
  trackedForCurrentOpen: boolean
}): { shouldTrack: boolean; trackedForCurrentOpen: boolean } {
  if (!open) {
    return { shouldTrack: false, trackedForCurrentOpen: false }
  }

  if (!hasCart || trackedForCurrentOpen) {
    return { shouldTrack: false, trackedForCurrentOpen }
  }

  return { shouldTrack: true, trackedForCurrentOpen: true }
}

function buildLineCollections(lines: CartLine[]) {
  const contents = lines.map(line => {
    const quantity = line.quantity || 1
    const lineValue = Number(line.cost.totalAmount.amount)

    return {
      id: line.merchandise.id,
      quantity,
      item_price: lineValue / quantity,
      title: line.merchandise.product.title
    }
  })
  const items = lines.map(line => {
    const quantity = line.quantity || 1
    const lineValue = Number(line.cost.totalAmount.amount)

    return {
      item_id: line.merchandise.id,
      item_name: line.merchandise.product.title,
      item_brand: line.merchandise.product.vendor,
      item_variant: line.merchandise.title,
      price: lineValue / quantity,
      quantity
    }
  })

  return { contents, items }
}

export function buildCartTrackingData(cart: Cart): MetaEventData {
  const { contents, items } = buildLineCollections(cart.lines)

  return {
    value: Number(cart.cost.totalAmount.amount),
    currency: cart.cost.totalAmount.currencyCode,
    content_ids: contents.map(item => item.id),
    content_type: 'product',
    num_items: cart.totalQuantity,
    contents,
    items
  }
}

export function buildCartLineTrackingData(line: CartLine): MetaEventData {
  const { contents, items } = buildLineCollections([line])

  return {
    value: Number(line.cost.totalAmount.amount),
    currency: line.cost.totalAmount.currencyCode,
    content_ids: [line.merchandise.id],
    content_type: 'product',
    num_items: line.quantity,
    contents,
    items
  }
}
