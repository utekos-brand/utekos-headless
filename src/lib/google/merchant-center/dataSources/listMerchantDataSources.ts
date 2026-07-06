import { getMerchantCenterConfig } from '../config'
import {
  merchantListDataSourcesResponseSchema,
  type MerchantDataSource
} from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function listMerchantDataSources() {
  const config = getMerchantCenterConfig()
  const dataSources: MerchantDataSource[] = []
  let nextPageToken: string | undefined

  do {
    const response = await merchantApiRequest({
      path: `/datasources/v1/${config.accountName}/dataSources`,
      searchParams: {
        pageSize: 1000,
        pageToken: nextPageToken
      },
      responseSchema: merchantListDataSourcesResponseSchema
    })

    dataSources.push(...(response.dataSources ?? []))
    nextPageToken = response.nextPageToken
  } while (nextPageToken)

  return dataSources
}
