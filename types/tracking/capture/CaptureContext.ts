// Path: types/tracking/capture/CaptureContext.ts

export type CaptureContext = {
  cookies: {
    fbp?: string | undefined
    fbc?: string | undefined
    externalId?: string | undefined
    userHash?: string | undefined
    scid?: string | undefined
    click_id?: string | undefined
    gclid?: string | undefined
    gbraid?: string | undefined
    wbraid?: string | undefined
    msclkid?: string | undefined
    dclid?: string | undefined
    gaClientId?: string | undefined
    gaSessionId?: string | undefined
  }
  clientIp: string
  userAgent: string
}
