import { Preference } from 'facebook-nodejs-business-sdk'

/**
 * Explicit Meta Parameter Builder allowlist for setRequestContext().
 * Constructor order matches facebook-nodejs-business-sdk@25.0.3 Preference:
 * fbc, fbp, client_ip_address, referrer_url, event_source_url.
 * Callers must only apply this after marketing consent is granted.
 */
export const metaMarketingRequestContextPreference = new Preference(
  true,
  true,
  true,
  true,
  true
)
