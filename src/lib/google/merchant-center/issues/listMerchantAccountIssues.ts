import { getMerchantCenterConfig } from '../config'
import {
  merchantListAccountIssuesResponseSchema,
  type MerchantAccountIssue
} from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function listMerchantAccountIssues() {
  const config = getMerchantCenterConfig()
  const accountIssues: MerchantAccountIssue[] = []
  let nextPageToken: string | undefined

  do {
    const response = await merchantApiRequest({
      path: `/accounts/v1/${config.accountName}/issues`,
      searchParams: {
        pageSize: 100,
        pageToken: nextPageToken,
        languageCode: 'en-US',
        timeZone: 'Europe/Oslo'
      },
      responseSchema: merchantListAccountIssuesResponseSchema
    })

    accountIssues.push(...(response.accountIssues ?? []))
    nextPageToken = response.nextPageToken
  } while (nextPageToken)

  return accountIssues
}
