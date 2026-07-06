import { getMerchantCenterConfig } from '../config'
import {
  merchantListAggregateProductStatusesResponseSchema,
  type MerchantAggregateProductStatus
} from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function listMerchantAggregateProductStatuses() {
  const config = getMerchantCenterConfig()
  const aggregateStatuses: MerchantAggregateProductStatus[] = []
  let nextPageToken: string | undefined

  do {
    const response = await merchantApiRequest({
      path: `/issueresolution/v1/${config.accountName}/aggregateProductStatuses`,
      searchParams: {
        pageSize: 1000,
        pageToken: nextPageToken
      },
      responseSchema: merchantListAggregateProductStatusesResponseSchema
    })

    aggregateStatuses.push(...(response.aggregateProductStatuses ?? []))
    nextPageToken = response.nextPageToken
  } while (nextPageToken)

  return aggregateStatuses
}
