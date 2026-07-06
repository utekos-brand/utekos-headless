import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT } from './constants.mjs'

/**
 * @param {string} dir
 * @param {(name: string) => boolean} [filter]
 * @returns {string[]}
 */
export function walkFiles(dir, filter) {
  /** @type {string[]} */
  const files = []
  for (const entry of readdirSync(dir)) {
    if (entry === '.DS_Store') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkFiles(full, filter))
    } else if (!filter || filter(entry)) {
      files.push(full)
    }
  }
  return files.sort()
}

/**
 * @returns {string[]}
 */
export function walkMd() {
  return walkFiles(ROOT, name => name.endsWith('.md'))
}

/**
 * @returns {string[]}
 */
export function walkAll() {
  return walkFiles(ROOT)
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function relFromRoot(filePath) {
  return relative(ROOT, filePath)
}

/**
 * @param {string} rel
 * @returns {string}
 */
export function domainGroup(rel) {
  if (rel.startsWith('components/')) return 'Runtime — components'
  if (rel.startsWith('types/')) return 'Runtime — types'
  if (rel.startsWith('utils/')) return 'Runtime — utils'
  if (rel === 'README.md') return 'Runtime — notes'
  if (rel === 'llms.md' || rel === 'agents.txt' || rel === 'klarna-sitemap.md') {
    return 'Agent index'
  }
  if (rel.startsWith('dev/docs/json/API/') && rel.endsWith('.json')) {
    return 'OpenAPI'
  }
  if (rel.startsWith('dev/docs/SCHEMAS/')) return 'JSON schemas'
  if (rel.startsWith('dev/docs/next-docs/')) return 'Next.js mirror'
  if (rel.startsWith('dev/docs/klarna-theme/')) return 'Express Checkout theme'
  if (rel.includes('/on-site-messaging/')) return 'On-site Messaging'
  if (rel.includes('/web-payments/')) return 'Web payments'
  if (rel.includes('/payment-api/')) return 'Payment API'
  if (rel.includes('/order-management/')) return 'Order Management'
  if (rel.includes('/integration-resilience/')) return 'Integration resilience'
  if (rel.includes('/sign-in-with-klarna/')) return 'Sign in with Klarna'
  if (rel.includes('/express-checkout/')) return 'Express Checkout'
  if (rel.includes('/kustom-api/')) return 'Kustom / HPP API'
  if (rel.includes('/boost-features/')) return 'Boost features'
  if (rel.includes('/legal/')) return 'Legal / compliance'
  if (rel.startsWith('dev/markdown/')) return 'Local markdown'
  if (rel.startsWith('dev/docs/markdown/')) return 'Klarna docs mirror'
  if (rel.startsWith('dev/docs/')) return 'Klarna docs'
  return 'Other'
}
