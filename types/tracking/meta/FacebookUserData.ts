// Path: types/tracking/meta/FacebookUserData.ts

export type FacebookUserData = {
  setClientIpAddress(ip: string): FacebookUserData
  setClientUserAgent(ua: string): FacebookUserData
  setFbc(fbc: string): FacebookUserData
  setFbp(fbp: string): FacebookUserData
}
