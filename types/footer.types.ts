// Path: types/footer.types.ts

import type { Route } from 'next'

export type FooterLink = {
  title: string
  path: Route
  external?: boolean
  trackingEvent?: string
}

export type FooterSection = {
  title: string
  links: FooterLink[]
}
