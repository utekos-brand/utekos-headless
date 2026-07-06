// Path: types/tracking/meta/MetaUserData.ts

export type MetaUserData = {
  fbp?: string | undefined
  fbc?: string | undefined
  external_id?: string | undefined

  // Common client identity signals
  client_user_agent?: string | undefined
  client_ip_address?: string | undefined

  // Hashed identity
  email_hash?: string | undefined
  email?: string | undefined
  phone?: string | undefined
  first_name?: string | undefined
  last_name?: string | undefined
  date_of_birth?: string | undefined
  gender?: string | undefined
  city?: string | undefined
  state?: string | undefined
  zip?: string | undefined
  country?: string | undefined
}
