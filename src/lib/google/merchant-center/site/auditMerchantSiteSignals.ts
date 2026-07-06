import { safeJsonParse } from '@/lib/utils/safeJsonParse'

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
const GOOGLEBOT_USER_AGENT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

type StructuredDataNode = Record<string, unknown>

type SiteAgentAudit = {
  status: number
  ok: boolean
  hasDoctype: boolean
  canonical: string | null
  hasCanonical: boolean
  hasNoindex: boolean
  structuredDataTypes: string[]
  hasOnlineStoreStructuredData: boolean
  hasProductStructuredData: boolean
  hasContactPoint: boolean
  hasAddress: boolean
  hasReturnPolicy: boolean
}

type SitePageAudit = {
  path: string
  url: string
  browser: SiteAgentAudit
  googlebot: SiteAgentAudit
  issues: string[]
}

function extractCanonical(html: string) {
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  )

  return canonicalMatch?.[1] ?? null
}

function hasNoindexDirective(html: string) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(
    html
  )
}

function collectStructuredDataNodes(
  value: unknown,
  nodes: StructuredDataNode[] = []
): StructuredDataNode[] {
  if (!value || typeof value !== 'object') {
    return nodes
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectStructuredDataNodes(entry, nodes)
    }

    return nodes
  }

  const record = value as StructuredDataNode

  if ('@type' in record) {
    nodes.push(record)
  }

  for (const nestedValue of Object.values(record)) {
    collectStructuredDataNodes(nestedValue, nodes)
  }

  return nodes
}

function extractStructuredDataNodes(html: string) {
  const matches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )

  const nodes: StructuredDataNode[] = []

  for (const match of matches) {
    const parsedJson = safeJsonParse<unknown>(match[1], null)
    collectStructuredDataNodes(parsedJson, nodes)
  }

  return nodes
}

function getStructuredDataTypes(nodes: StructuredDataNode[]) {
  const types = new Set<string>()

  for (const node of nodes) {
    const typeValue = node['@type']

    if (typeof typeValue === 'string') {
      types.add(typeValue)
      continue
    }

    if (Array.isArray(typeValue)) {
      for (const typeEntry of typeValue) {
        if (typeof typeEntry === 'string') {
          types.add(typeEntry)
        }
      }
    }
  }

  return Array.from(types)
}

function nodeHasType(node: StructuredDataNode, expectedType: string) {
  const typeValue = node['@type']

  if (typeof typeValue === 'string') {
    return typeValue === expectedType
  }

  if (Array.isArray(typeValue)) {
    return typeValue.includes(expectedType)
  }

  return false
}

function buildStructuredDataAudit(nodes: StructuredDataNode[]) {
  return {
    structuredDataTypes: getStructuredDataTypes(nodes),
    hasOnlineStoreStructuredData: nodes.some(node =>
      nodeHasType(node, 'OnlineStore')
    ),
    hasProductStructuredData: nodes.some(node => nodeHasType(node, 'Product')),
    hasContactPoint: nodes.some(
      node =>
        (nodeHasType(node, 'Organization') || nodeHasType(node, 'OnlineStore')) &&
        'contactPoint' in node
    ),
    hasAddress: nodes.some(
      node =>
        (nodeHasType(node, 'Organization') || nodeHasType(node, 'OnlineStore')) &&
        'address' in node
    ),
    hasReturnPolicy: nodes.some(
      node =>
        nodeHasType(node, 'MerchantReturnPolicy') ||
        'hasMerchantReturnPolicy' in node ||
        'merchantReturnPolicy' in node
    )
  }
}

async function fetchPageAudit(url: string, userAgent: string): Promise<SiteAgentAudit> {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent,
      'accept-language': 'no-NO,no;q=0.9,en;q=0.8'
    },
    redirect: 'follow',
    cache: 'no-store'
  })
  const html = await response.text()
  const structuredDataNodes = extractStructuredDataNodes(html)
  const structuredDataAudit = buildStructuredDataAudit(structuredDataNodes)

  return {
    status: response.status,
    ok: response.ok,
    hasDoctype: /^<!DOCTYPE html>/i.test(html.trimStart()),
    canonical: extractCanonical(html),
    hasCanonical: Boolean(extractCanonical(html)),
    hasNoindex: hasNoindexDirective(html),
    ...structuredDataAudit
  }
}

function buildPageIssues(
  path: string,
  browserAudit: SiteAgentAudit,
  googlebotAudit: SiteAgentAudit,
  merchantLink?: string
) {
  const issues: string[] = []

  if (!browserAudit.ok) {
    issues.push(`Browser UA returned ${browserAudit.status}`)
  }

  if (!googlebotAudit.ok) {
    issues.push(`Googlebot UA returned ${googlebotAudit.status}`)
  }

  if (!browserAudit.hasDoctype) {
    issues.push('Missing <!DOCTYPE html>')
  }

  if (browserAudit.hasNoindex || googlebotAudit.hasNoindex) {
    issues.push('Page exposes noindex directive')
  }

  if (path.startsWith('/produkter/') && merchantLink) {
    if (browserAudit.canonical !== merchantLink) {
      issues.push(`Canonical mismatch. Expected ${merchantLink}`)
    }

    if (!browserAudit.hasProductStructuredData) {
      issues.push('Missing Product JSON-LD on product page')
    }
  }

  if (path === '/' && !browserAudit.hasContactPoint) {
    issues.push('Homepage structured data missing contactPoint')
  }

  if (path === '/' && !browserAudit.hasAddress) {
    issues.push('Homepage structured data missing address')
  }

  if (path === '/' && !browserAudit.hasReturnPolicy) {
    issues.push('Homepage structured data missing return policy')
  }

  return issues
}

export async function auditMerchantSiteSignals(productHandle?: string) {
  const auditedPaths = [
    '/',
    '/produkter',
    productHandle ? `/produkter/${productHandle}` : null,
    '/kontaktskjema',
    '/frakt-og-retur',
    '/personvern',
    '/vilkar-betingelser'
  ].filter((path): path is string => Boolean(path))

  const merchantLink = productHandle
    ? `https://utekos.no/produkter/${productHandle}`
    : undefined
  const pages: SitePageAudit[] = []

  for (const path of auditedPaths) {
    const url = new URL(path, 'https://utekos.no').toString()
    const [browserAudit, googlebotAudit] = await Promise.all([
      fetchPageAudit(url, BROWSER_USER_AGENT),
      fetchPageAudit(url, GOOGLEBOT_USER_AGENT)
    ])

    pages.push({
      path,
      url,
      browser: browserAudit,
      googlebot: googlebotAudit,
      issues: buildPageIssues(path, browserAudit, googlebotAudit, merchantLink)
    })
  }

  const homepageAudit = pages.find(page => page.path === '/')?.browser
  const productPageAudit = pages.find(page => page.path.startsWith('/produkter/'))

  return {
    checkedAt: new Date().toISOString(),
    productHandle: productHandle ?? null,
    merchantLink: merchantLink ?? null,
    summary: {
      homepageHasOnlineStoreStructuredData:
        homepageAudit?.hasOnlineStoreStructuredData ?? false,
      homepageHasContactPoint: homepageAudit?.hasContactPoint ?? false,
      homepageHasAddress: homepageAudit?.hasAddress ?? false,
      homepageHasReturnPolicy: homepageAudit?.hasReturnPolicy ?? false,
      productCanonicalMatchesMerchantLink:
        productHandle ?
          productPageAudit?.browser.canonical === merchantLink
        : null,
      productHasProductStructuredData:
        productHandle ?
          (productPageAudit?.browser.hasProductStructuredData ?? false)
        : null
    },
    pages
  }
}
