import { z } from 'zod'

const optionalIdentifier = z.string().trim().min(1).max(512).optional()

const trackingUserDataSchema = z.object({
  fbp: optionalIdentifier,
  fbc: optionalIdentifier,
  external_id: optionalIdentifier,
  client_user_agent: z.string().max(1024).optional(),
  client_ip_address: z.string().max(64).optional(),
  email_hash: optionalIdentifier,
  email: z.string().email().max(320).optional(),
  phone: z.string().max(64).optional(),
  first_name: z.string().max(128).optional(),
  last_name: z.string().max(128).optional(),
  date_of_birth: z.string().max(32).optional(),
  gender: z.string().max(32).optional(),
  city: z.string().max(128).optional(),
  state: z.string().max(128).optional(),
  zip: z.string().max(32).optional(),
  country: z.string().max(8).optional(),
  scid: optionalIdentifier,
  click_id: optionalIdentifier,
  gclid: optionalIdentifier,
  gbraid: optionalIdentifier,
  wbraid: optionalIdentifier,
  msclkid: optionalIdentifier,
  dclid: optionalIdentifier
}).strict()

export const captureBodySchema = z.object({
  cartId: z.string().trim().min(1).max(512).nullable().optional(),
  checkoutUrl: z.url().max(2048),
  eventId: optionalIdentifier,
  gaClientId: optionalIdentifier,
  gaSessionId: optionalIdentifier,
  userData: trackingUserDataSchema.optional()
}).strict()
