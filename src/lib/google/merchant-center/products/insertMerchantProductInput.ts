import type { MerchantProductInputPayload } from '../merchantCenterTypes'
import { merchantInsertedProductInputSchema } from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function insertMerchantProductInput(
  input: MerchantProductInputPayload,
  dataSourceName: string,
  parentAccountName: string
) {
  return merchantApiRequest({
    path: `/products/v1/${parentAccountName}/productInputs:insert`,
    method: 'POST',
    searchParams: {
      dataSource: dataSourceName
    },
    body: input,
    responseSchema: merchantInsertedProductInputSchema
  })
}
