import { getMerchantCenterConfig } from '../config'
import {
  merchantListProcessedProductsResponseSchema,
  type MerchantProcessedProduct
} from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function listMerchantProcessedProducts() {
  const config = getMerchantCenterConfig()
  const products: MerchantProcessedProduct[] = []
  let nextPageToken: string | undefined

  do {
    const response = await merchantApiRequest({
      path: `/products/v1/${config.accountName}/products`,
      searchParams: {
        pageSize: 1000,
        pageToken: nextPageToken
      },
      responseSchema: merchantListProcessedProductsResponseSchema
    })

    products.push(...(response.products ?? []))
    nextPageToken = response.nextPageToken
  } while (nextPageToken)

  return products
}
