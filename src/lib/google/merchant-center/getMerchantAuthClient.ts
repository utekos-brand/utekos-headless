import { JWT } from 'google-auth-library'

import {
  getMerchantCenterConfig,
  MERCHANT_CENTER_CONTENT_SCOPE
} from './config'

let merchantAuthClient: JWT | null = null

export function getMerchantAuthClient() {
  if (merchantAuthClient) {
    return merchantAuthClient
  }

  const config = getMerchantCenterConfig()

  merchantAuthClient = new JWT({
    email: config.serviceAccount.clientEmail,
    key: config.serviceAccount.privateKey,
    scopes: [MERCHANT_CENTER_CONTENT_SCOPE]
  })

  return merchantAuthClient
}
