// Path: src/lib/helpers/normalizers/normalizeShopifyUrl.ts

import type { Route } from 'next'

export function normalizeShopifyUrl(url: string): Route {
  let urlPath = url.replace(/^https?:\/\/[^\/]+/, '')
  if (urlPath.startsWith('/products/')) {
    urlPath = urlPath.replace('/products/', '/produkter/')
  }

  const urlMappings: Record<string, string> = {
    '/pages/vaske-og-vedlikehold/produktguide':
      '/footer-routes/kjøpshjelp/produktguide/vask-og-vedlikehold',
    '/pages/utekos/storrelsesguide':
      '/footer-routes/kjøpshjelp/storrelsesguide',
    '/pages/productinfo/teknologi-og-materialer':
      '/footer-routes/kjøpshjelp/specs',
    '/pages/kundeservice/kontaktskjema': '/kontaktskjema',
    '/pages/kontakt-oss': '/kontaktskjema'
  }

  return (urlMappings[urlPath] || urlPath) as Route
}
