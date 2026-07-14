import JSONBig from 'json-bigint'
import {
  shopifyRefundSchema,
  type ShopifyRefund
} from './shopifyRefundSchema'

const losslessJson = JSONBig({
  strict: true,
  storeAsString: true,
  protoAction: 'error',
  constructorAction: 'error'
})

export function parseShopifyRefundWebhook(rawBody: string): ShopifyRefund {
  return shopifyRefundSchema.parse(losslessJson.parse(rawBody))
}
