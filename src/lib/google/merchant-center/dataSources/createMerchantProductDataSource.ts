import {
  getMerchantCenterConfig,
  MERCHANT_CENTER_DEFAULTS
} from '../config'
import { merchantCreatedDataSourceSchema } from '../merchantCenterTypes'
import { merchantApiRequest } from '../merchantApiRequest'

export async function createMerchantProductDataSource() {
  const config = getMerchantCenterConfig()

  return merchantApiRequest({
    path: `/datasources/v1/${config.accountName}/dataSources`,
    method: 'POST',
    body: {
      displayName: config.primaryDataSourceDisplayName,
      primaryProductDataSource: {
        feedLabel: MERCHANT_CENTER_DEFAULTS.feedLabel,
        contentLanguage: MERCHANT_CENTER_DEFAULTS.contentLanguage,
        countries: [MERCHANT_CENTER_DEFAULTS.countryCode]
      }
    },
    responseSchema: merchantCreatedDataSourceSchema
  })
}
