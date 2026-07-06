import 'server-only'

import { JWT } from 'google-auth-library'

import { DATA_MANAGER_SCOPE } from './customerMatchTypes'
import { getGoogleDataManagerConfig } from './dataManagerConfig'

export async function getDataManagerAccessToken() {
  const config = getGoogleDataManagerConfig()
  const client = new JWT({
    email: config.serviceAccount.clientEmail,
    key: config.serviceAccount.privateKey,
    scopes: [DATA_MANAGER_SCOPE]
  })

  const tokens = await client.authorize()

  if (!tokens.access_token) {
    throw new Error('Google Data Manager API did not return an access token.')
  }

  return tokens.access_token
}
