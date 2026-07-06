#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(process.cwd(), 'docs/google')
const OUT = join(process.cwd(), 'scripts/google-docs/sources.json')

/** @type {Record<string, string | null>} */
const MANUAL = {
  'google-analytics/definitons/key-event.md': 'https://support.google.com/analytics/answer/9267568',
  'google-analytics/definitons/variables.md': 'https://support.google.com/tagmanager/answer/7683369',
  'google-analytics/events/google-tag-manager/build-in-variables-web-container.md':
    'https://support.google.com/tagmanager/answer/7182738',
  'google-analytics/measurement-protocol/user-provided-data.md':
    'https://developers.google.com/analytics/devguides/collection/protocol/ga4'
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkMd(dir) {
  /** @type {string[]} */
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkMd(full))
    } else if (entry.endsWith('.md')) {
      files.push(relative(ROOT, full))
    }
  }
  return files.sort()
}

/**
 * @param {string} raw
 * @returns {string}
 */
function cleanUrl(raw) {
  return raw.replace(/[)\]`'".,;]+$/, '')
}

/**
 * @param {string} content
 * @returns {string | null}
 */
function extractUrlFromContent(content) {
  const yamlUrl = content.match(
    /^url:\s*['"]?(https:\/\/(?:support|developers)\.google\.com\/[^'"\n]+)['"]?/m
  )
  if (yamlUrl) return cleanUrl(yamlUrl[1])

  const sourceLine = content.match(
    /^Source(?: URL)?:\s*(https:\/\/(?:support|developers)\.google\.com\/\S+)/m
  )
  if (sourceLine) return cleanUrl(sourceLine[1])

  const docsLink = content.match(/https:\/\/(?:support|developers)\.google\.com\/[^\s)\]`'"]+/)
  if (docsLink) return cleanUrl(docsLink[0])

  return null
}

const files = walkMd(ROOT)
/** @type {Record<string, string | null>} */
const sources = {}

for (const rel of files) {
  const content = readFileSync(join(ROOT, rel), 'utf8')
  sources[rel] = MANUAL[rel] ?? extractUrlFromContent(content)
}

writeFileSync(OUT, `${JSON.stringify(sources, null, 2)}\n`)
console.log(`Wrote ${Object.keys(sources).length} entries to ${OUT}`)
