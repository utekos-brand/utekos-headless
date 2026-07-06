import { z } from 'zod'

import { getMerchantCenterConfig } from '../config'
import { merchantApiRequest } from '../merchantApiRequest'

const merchantDeveloperRegistrationSchema = z
  .object({
    name: z.string(),
    gcpIds: z.array(z.string()).optional()
  })
  .passthrough()

export async function registerMerchantGcp(developerEmail: string) {
  const config = getMerchantCenterConfig()

  return merchantApiRequest({
    path: `/accounts/v1/${config.accountName}/developerRegistration:registerGcp`,
    method: 'POST',
    body: {
      developerEmail
    },
    responseSchema: merchantDeveloperRegistrationSchema
  })
}
