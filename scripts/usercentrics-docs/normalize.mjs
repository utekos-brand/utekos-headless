#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, basename } from 'node:path'
import {
  extractHeadingText,
  slugifyHeading,
  uniqueSlug,
  isHeadingLine,
} from './slugify.mjs'

const ROOT = join(process.cwd(), 'docs/consent-management/usercentrics')
const DOCS_INDEX = '/docs/consent-management/usercentrics/agents.txt'
const BLOCKQUOTE =
  '> Global Usercentrics Documentation index: [agents.txt](/docs/consent-management/usercentrics/agents.txt).'
const DEFAULT_AI_DIRECTIVE =
  'Read docs_index before implementing. Do not infer script order or consent state.'

const sources = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts/usercentrics-docs/sources.json'), 'utf8')
)

const STUB_PATHS = new Set([
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/UC_CONSENT.md',
  'web/features/events/consent-events/browser-events/docs/usercentrics/web/features/events/consent-events/browser-events/current_status.md',
])

const DUPLICATE_PATHS = new Set([
  'web/features/events/consent-events/browser-events/current_status.md',
])

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
      files.push(full)
    }
  }
  return files.sort()
}

/**
 * @param {string} content
 * @returns {{ yaml: Record<string, string>; body: string; hadFrontmatter: boolean }}
 */
function parseFrontmatter(content) {
  /** @type {Record<string, string>} */
  const yaml = {}
  if (!content.startsWith('---\n')) {
    return { yaml, body: content, hadFrontmatter: false }
  }
  const end = content.indexOf('\n---\n', 4)
  if (end === -1) {
    return { yaml, body: content, hadFrontmatter: false }
  }
  const raw = content.slice(4, end)
  for (const line of raw.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/)
    if (m) {
      yaml[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim()
    }
  }
  return { yaml, body: content.slice(end + 5), hadFrontmatter: true }
}

/**
 * @param {string} rel
 * @returns {string}
 */
function inferDomain(rel) {
  if (rel.startsWith('server-side-tagging/')) return 'Server-Side Tagging'
  if (
    rel === 'general_info.md' ||
    rel === 'ga.md' ||
    rel.startsWith('google-consent-mode')
  ) {
    return 'Google Consent Mode'
  }
  if (rel.startsWith('articles/')) return 'Articles'
  return 'Consent Management'
}

/**
 * @param {string} rel
 * @returns {string}
 */
function inferId(rel, existing) {
  if (existing) return existing
  const base = basename(rel, '.md')
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * @param {string} body
 * @returns {string}
 */
function stripLeadingNoise(body) {
  let lines = body.split('\n')
  while (
    lines.length &&
    (lines[0].trim() === '' ||
      lines[0].startsWith('> Global Usercentrics') ||
      lines[0].startsWith('> Global index'))
  ) {
    lines.shift()
  }
  return lines.join('\n')
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isPseudoSourceHeading(line) {
  return /^#{1,4}\s+\[Usercentrics Docs:/.test(line)
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isSourceLine(line) {
  const t = line.trim()
  return (
    t.startsWith('Source:') ||
    t.startsWith('**Source:**') ||
    t.startsWith('[Source:') ||
    /^Source:\s*$/.test(t)
  )
}

/**
 * @param {string} body
 * @param {string} filename
 * @returns {string}
 */
function rewriteHeadings(body, filename) {
  const used = new Set()
  let h1Count = 0
  const lines = body.split('\n')
  /** @type {string[]} */
  const out = []

  for (const line of lines) {
    if (!isHeadingLine(line)) {
      out.push(line)
      continue
    }

    const level = line.match(/^(#{1,4})/)?.[1] ?? '#'
    const text = extractHeadingText(line)
    const slug = uniqueSlug(slugifyHeading(text), used)

    if (level === '#') {
      h1Count++
      if (h1Count === 1) {
        out.push(`# [${text}](./${filename})`)
      } else {
        out.push(`# [${text}](#${slug})`)
      }
    } else {
      out.push(`${level} [${text}](#${slug})`)
    }
  }

  return out.join('\n')
}

/**
 * @param {string} body
 * @returns {string | undefined}
 */
function extractDescription(body) {
  const lines = body.split('\n')
  let passedH1 = false
  for (const line of lines) {
    if (/^#\s+\[/.test(line)) {
      passedH1 = true
      continue
    }
    if (!passedH1) continue
    if (line.startsWith('Source:')) continue
    if (line.trim() === '' || line.startsWith('>') || line.startsWith('#')) continue
    if (line.startsWith('---')) continue
    const cleaned = line.replace(/`/g, '').trim()
    if (cleaned.length > 20) {
      return cleaned.length > 200 ? `${cleaned.slice(0, 197)}...` : cleaned
    }
  }
  return undefined
}

/**
 * @param {string} body
 * @param {string | null | undefined} url
 * @param {string | undefined} status
 * @returns {string}
 */
function insertSourceLine(body, url, status) {
  const lines = body.split('\n')
  /** @type {string[]} */
  const filtered = []
  let skipNextUrl = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (isPseudoSourceHeading(line)) continue
    if (isSourceLine(line)) {
      if (line.trim() === 'Source:' && lines[i + 1]?.startsWith('http')) {
        i++
      }
      continue
    }
    if (skipNextUrl && line.startsWith('http')) {
      skipNextUrl = false
      continue
    }
    if (/^-\s+\*\*Official source:\*\*/.test(line)) continue
    if (/^## Documentation Reference/.test(line)) {
      while (i + 1 < lines.length && lines[i + 1].startsWith('-')) i++
      continue
    }

    filtered.push(line)
  }

  let result = filtered.join('\n').replace(/\n{3,}/g, '\n\n')

  if (url && status !== 'stub' && status !== 'duplicate') {
    const h1Idx = result.split('\n').findIndex((l) => /^#\s+\[/.test(l))
    if (h1Idx !== -1) {
      const resultLines = result.split('\n')
      resultLines.splice(h1Idx + 1, 0, '', `Source: ${url}`)
      result = resultLines.join('\n')
    }
  }

  return result
}

/**
 * @param {Record<string, string>} yaml
 * @returns {string}
 */
function serializeFrontmatter(yaml) {
  const order = [
    'id',
    'title',
    'description',
    'url',
    'domain',
    'version_target',
    'last_updated',
    'docs_index',
    'status',
    'dependencies',
    'ai_directive',
  ]
  /** @type {string[]} */
  const lines = ['---']
  for (const key of order) {
    if (yaml[key] === undefined) continue
    const val = yaml[key]
    if (key === 'ai_directive' || key === 'description' || key === 'title') {
      lines.push(`${key}: '${val.replace(/'/g, "''")}'`)
    } else {
      lines.push(`${key}: '${val}'`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function normalizeFile(filePath) {
  const rel = relative(ROOT, filePath)
  const filename = basename(filePath)
  const raw = readFileSync(filePath, 'utf8')
  const { yaml: existing, body: rawBody } = parseFrontmatter(raw)

  let body = stripLeadingNoise(rawBody)
  body = rewriteHeadings(body, filename)

  const firstH1 = body.match(/^#\s+\[(.+?)\]\(\.\//m)?.[1] ?? basename(filename, '.md')
  const status =
    existing.status ??
    (STUB_PATHS.has(rel) ? 'stub' : DUPLICATE_PATHS.has(rel) ? 'duplicate' : 'complete')

  const url = sources[rel] ?? existing.url

  /** @type {Record<string, string>} */
  const yaml = {
    id: inferId(rel, existing.id),
    title: existing.title ?? firstH1,
    description:
      existing.description ?? extractDescription(body) ?? `Local mirror: ${firstH1}`,
    domain: existing.domain ?? inferDomain(rel),
    version_target: existing.version_target ?? 'CMP V3',
    last_updated: existing.last_updated ?? '2026-06-10',
    docs_index: DOCS_INDEX,
    status,
    ai_directive: existing.ai_directive ?? DEFAULT_AI_DIRECTIVE,
  }

  if (url) yaml.url = url
  if (existing.dependencies) yaml.dependencies = existing.dependencies

  if (status === 'duplicate') {
    yaml.dependencies =
      existing.dependencies ??
      'consent-management/web/web-cmp-latest-version/implementation/browser-events/current_status.md'
  }
  if (rel.includes('UC_CONSENT.md') && status === 'stub') {
    yaml.dependencies =
      existing.dependencies ??
      'consent-management/web/web-cmp-latest-version/implementation/browser-events/current_status.md'
  }

  body = insertSourceLine(body, url, status === 'duplicate' ? 'duplicate' : undefined)

  if (status === 'stub' && rel.includes('UC_CONSENT.md') && body.trim() === '') {
    body = `# [UC_CONSENT](./UC_CONSENT.md)

> Stub — see [current_status.md](../current_status.md) and official docs.

Source: ${url ?? 'https://usercentrics.com/docs/web/features/events/uc-consent/'}`
  }

  return `${serializeFrontmatter(yaml)}\n\n${BLOCKQUOTE}\n\n${body.trim()}\n`
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const check = args.includes('--check')
const paths = args.filter((a) => !a.startsWith('--'))

/** @type {string[]} */
const files = paths.length
  ? paths.flatMap((p) => {
      const full = join(process.cwd(), p)
      return statSync(full).isDirectory() ? walkMd(full) : [full]
    })
  : walkMd(ROOT)

let changed = 0
for (const file of files) {
  const before = readFileSync(file, 'utf8')
  const after = normalizeFile(file)
  if (before !== after) {
    changed++
    if (write) {
      writeFileSync(file, after)
      console.log(`updated: ${relative(ROOT, file)}`)
    } else if (check) {
      console.log(`would update: ${relative(ROOT, file)}`)
    }
  }
}

console.log(`${write ? 'Updated' : check ? 'Would update' : 'Processed'} ${changed}/${files.length} files`)
if (check && changed > 0) process.exit(1)
