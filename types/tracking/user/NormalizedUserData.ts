
export type NormalizedUserData = {
  sha256_email_address?: string[]
  sha256_phone_number?: string[]
  address?: {
    sha256_first_name?: string[]
    sha256_last_name?: string[]
    sha256_street?: string[]
    city?: string
    region?: string
    postal_code?: string
    country?: string
  }[]
}
