// src/components/analytics/MetaPixel/getPageViewParams.ts

export function getPageViewParams(pathname: string) {
  const safePath = pathname || '/'
  const segments = safePath.split('/').filter(Boolean)
  const firstSegment = segments[0] || 'home'

  const params: Record<string, string> = {
    // Vi unngår document.title her for å forhindre hydration mismatch mellom server og klient.
    // Vi bruker pathname som fallback content_name, som er konsistent.
    content_name: safePath === '/' ? 'Forside' : safePath,
    content_category: firstSegment
  }

  if (safePath === '/') {
    params.content_type = 'home'
  } else if (safePath === '/produkter') {
    params.content_type = 'product_list'
  } else if (safePath.startsWith('/produkter/')) {
    params.content_type = 'product'
  } else if (safePath.startsWith('/inspirasjon')) {
    params.content_type =
      safePath === '/inspirasjon' ? 'inspiration_overview' : 'inspiration'
  } else if (safePath.startsWith('/magasinet')) {
    params.content_type = safePath === '/magasinet' ? 'magazine' : 'article'
  } else if (safePath.startsWith('/handlehjelp')) {
    params.content_type = 'help'
  } else if (safePath.includes('/handlekurv') || safePath.includes('/cart')) {
    params.content_type = 'cart'
  } else {
    params.content_type = 'page'
  }

  return params
}
