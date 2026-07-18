import { hashCustomerMatchIdentifier } from '@/lib/google/data-manager/hashCustomerMatchIdentifier'
import { normalizeCustomerMatchEmail } from '@/lib/google/data-manager/normalizeCustomerMatchEmail'
import { normalizeCustomerMatchPhone } from '@/lib/google/data-manager/normalizeCustomerMatchPhone'

export type LeadUserDataHashes = {
  emailSha256?: string[]
  phoneSha256?: string[]
}

export function buildLeadUserDataHashes(input: {
  email?: string
  phone?: string
}): LeadUserDataHashes {
  const emailNormalized =
    input.email ? normalizeCustomerMatchEmail(input.email) : undefined
  const phoneNormalized =
    input.phone ? normalizeCustomerMatchPhone(input.phone) : undefined

  return {
    ...(emailNormalized ?
      { emailSha256: [hashCustomerMatchIdentifier(emailNormalized)] }
    : {}),
    ...(phoneNormalized ?
      { phoneSha256: [hashCustomerMatchIdentifier(phoneNormalized)] }
    : {})
  }
}
