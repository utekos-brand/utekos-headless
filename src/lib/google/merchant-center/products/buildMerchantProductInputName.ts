import { getMerchantCenterConfig } from '../config'

export function buildMerchantProductInputName(
  contentLanguage: string,
  feedLabel: string,
  offerId: string
) {
  const config = getMerchantCenterConfig()
  const productId = `${contentLanguage}~${feedLabel}~${offerId}`
  const encodedProductId = Buffer.from(productId, 'utf8').toString('base64url')

  return `${config.accountName}/productInputs/${encodedProductId}`
}
