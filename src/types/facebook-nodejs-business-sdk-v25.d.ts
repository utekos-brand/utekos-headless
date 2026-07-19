import type { PlainDataObject } from 'capi-param-builder-nodejs'
import 'facebook-nodejs-business-sdk'

type MetaRequestContextPreference = {
  isClientIpAddressAllowed(): boolean
  isEventSourceUrlAllowed(): boolean
  isFbcAllowed(): boolean
  isFbpAllowed(): boolean
  isReferrerUrlAllowed(): boolean
}

declare module 'facebook-nodejs-business-sdk' {
  interface ServerEvent {
    setRequestContext(
      context: PlainDataObject,
      preference?: MetaRequestContextPreference | null
    ): ServerEvent
  }
}
