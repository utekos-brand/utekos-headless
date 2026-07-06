// Path: types/tracking/pinterest/PinterestLeadProps.ts

export type PinterestLeadProps = {
  eventId: string
  emailHash: string
  clientIp: string | undefined
  userAgent: string
  url: string
  clickId?: string | undefined
  fbp?: string | undefined
  fbc?: string | undefined
}
