'use client'

import { useEffect, useRef } from 'react'

import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'
import type { MetaEventType } from 'types/tracking/meta/event'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

type ProductListTrackingProps = {
  products: ShopifyProduct[]
  eventName?: Extract<MetaEventType, 'ViewCategory' | 'ViewItemList'>
  itemListId: string
  itemListName: string
  contentCategory?: string
}

function getPrimaryVariant(product: ShopifyProduct): ShopifyProductVariant | null {
  return product.selectedOrFirstAvailableVariant ?? product.variants.edges[0]?.node ?? null
}

function buildProductListEventData({
  products,
  itemListId,
  itemListName,
  contentCategory
}: Omit<ProductListTrackingProps, 'eventName'>) {
  const contents = products
    .map((product, index) => {
      const variant = getPrimaryVariant(product)
      const contentId =
        cleanShopifyId(variant?.id) || cleanShopifyId(product.id) || product.handle
      const price = variant?.price?.amount ? Number(variant.price.amount) : undefined

      return {
        id: contentId,
        quantity: 1,
        item_price: Number.isFinite(price) ? price : undefined,
        item_name: product.title,
        item_brand: product.vendor || 'Utekos',
        item_category: product.productType || contentCategory,
        item_variant: variant?.title,
        item_list_id: itemListId,
        item_list_name: itemListName,
        index
      }
    })
    .filter(item => Boolean(item.id))

  return {
    content_name: itemListName,
    content_type: 'product_group',
    content_category: contentCategory,
    content_ids: contents.map(item => item.id),
    contents,
    item_list_id: itemListId,
    item_list_name: itemListName,
    num_items: contents.length
  }
}

export function ProductListTracking({
  products,
  eventName = 'ViewItemList',
  itemListId,
  itemListName,
  contentCategory = 'Utekos products'
}: ProductListTrackingProps) {
  const eventFired = useRef<string | null>(null)

  useEffect(() => {
    const productKey = products.map(product => product.id).join('|')
    const eventKey = `${eventName}:${itemListId}:${productKey}`

    if (!productKey || eventFired.current === eventKey) {
      return
    }

    eventFired.current = eventKey

    return runAfterPageSettles(() => {
      void dispatchTrackingEvent({
        eventName,
        eventId: generateEventID(),
        destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
        eventData: buildProductListEventData({
          products,
          itemListId,
          itemListName,
          contentCategory
        })
      })
    })
  }, [contentCategory, eventName, itemListId, itemListName, products])

  return null
}
