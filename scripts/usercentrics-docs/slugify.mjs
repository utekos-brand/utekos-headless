/** @typedef {Set<string>} UsedSlugs */

/**
 * Extract visible heading text from markdown heading line.
 * @param {string} line
 * @returns {string}
 */
export function extractHeadingText(line) {
  const match = line.match(/^#{1,4}\s+(.+)$/)
  if (!match) return ''

  let text = match[1].trim()
  text = text.replace(/\[¶\]\([^)]*\)/g, '')
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  return text.trim()
}

/**
 * GitHub-compatible slug from heading text.
 * @param {string} text
 * @returns {string}
 */
export function slugifyHeading(text) {
  return text
    .replace(/\[¶\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * @param {string} base
 * @param {UsedSlugs} used
 * @returns {string}
 */
export function uniqueSlug(base, used) {
  let slug = base || 'section'
  let n = 2
  while (used.has(slug)) {
    slug = `${base || 'section'}-${n++}`
  }
  used.add(slug)
  return slug
}

/**
 * @param {string} line
 * @returns {boolean}
 */
export function isHeadingLine(line) {
  return /^#{1,4}\s+/.test(line)
}

/**
 * @param {string} line
 * @returns {boolean}
 */
export function isTaggableHeading(line) {
  return /^#{1,4}\s+\[.+\]\((#\S+|\.\/[^)]+\.md)\)/.test(line)
}
