export type ConsentProvenance = {
  schemaVersion: 1
  source: 'cookiebot'
  capturedAt: string
  services: {
    googleAnalytics: boolean
    googleAds: boolean
    meta: boolean
    microsoftAdvertising: boolean
  }
}
