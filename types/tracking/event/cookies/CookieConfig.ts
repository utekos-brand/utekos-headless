// Path: types/tracking/event/cookies/CookieConfig.ts

export type CookieConfig = {
  name: string
  value: string
  maxAge: number
  path: string
  domain?: string
  sameSite: 'Strict' | 'Lax' | 'None'
  secure: boolean
}
