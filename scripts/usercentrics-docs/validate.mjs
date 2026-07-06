#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { isHeadingLine, isTaggableHeading } from './slugify.mjs'

const ROOT = join(process.cwd(), 'docs/consent-management/usercentrics')
const DOCS_INDEX = '/docs/consent-management/usercentrics/agents.txt'
const BLOCKQUOTE =
  '> Global Usercentrics Documentation index: [agents.txt](/docs/consent-management/usercentrics/agents.txt).'

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
 * @returns {{ yaml: string | null; body: string }}
 */
function splitFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return { yaml: null, body: content }
  }
  const end = content.indexOf('\n---\n', 4)
  if (end === -1) {
    return { yaml: null, body: content }
  }
  return {
    yaml: content.slice(4, end),
    body: content.slice(end + 5),
  }
}

/**
 * @param {string} yaml
 * @param {string} key
 * @returns {string | undefined}
 */
function getYamlValue(yaml, key) {
  const match = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  if (!match) return undefined
  return match[1].replace(/^['"]|['"]$/g, '').trim()
}

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {string[]}
 */
function validateFile(filePath, content) {
  const rel = relative(ROOT, filePath)
  /** @type {string[]} */
  const errors = []
  const { yaml, body } = splitFrontmatter(content)

  if (!yaml) {
    errors.push('missing YAML frontmatter')
    return errors.map((e) => `${rel}: ${e}`)
  }

  for (const key of ['docs_index', 'title', 'last_updated']) {
    if (!getYamlValue(yaml, key)) {
      errors.push(`frontmatter missing ${key}`)
    }
  }

  const docsIndex = getYamlValue(yaml, 'docs_index')
  if (docsIndex !== DOCS_INDEX) {
    errors.push(`docs_index must be ${DOCS_INDEX}, got ${docsIndex ?? 'undefined'}`)
  }

  if (!body.includes(BLOCKQUOTE)) {
    errors.push('missing agents.txt blockquote')
  }

  const lines = body.split('\n')
  for (const line of lines) {
    if (isHeadingLine(line) && !isTaggableHeading(line)) {
      errors.push(`untagged heading: ${line.slice(0, 80)}`)
    }
    if (/^#{1,4}\s+.*\[¶\]\(/.test(line)) {
      errors.push(`MkDocs artifact in heading: ${line.slice(0, 80)}`)
    }
  }

  const status = getYamlValue(yaml, 'status')
  const url = getYamlValue(yaml, 'url')
  if (url && status !== 'stub' && status !== 'duplicate') {
    const sourceLines = lines.filter((l) => l.startsWith('Source: '))
    if (sourceLines.length !== 1) {
      errors.push(`expected exactly one Source: line, found ${sourceLines.length}`)
    } else if (sourceLines[0] !== `Source: ${url}`) {
      errors.push(`Source line mismatch: ${sourceLines[0]}`)
    }
  }

  return errors.map((e) => `${rel}: ${e}`)
}

/** @type {string[]} */
const targets = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => join(process.cwd(), p))
  : walkMd(ROOT)

/** @type {string[]} */
const allErrors = []

for (const file of targets) {
  const stat = statSync(file)
  if (stat.isDirectory()) {
    for (const f of walkMd(file)) {
      allErrors.push(...validateFile(f, readFileSync(f, 'utf8')))
    }
  } else if (file.endsWith('.md')) {
    allErrors.push(...validateFile(file, readFileSync(file, 'utf8')))
  }
}

if (allErrors.length) {
  console.error(`Validation failed (${allErrors.length} issues):\n`)
  for (const err of allErrors.slice(0, 100)) {
    console.error(`  - ${err}`)
  }
  if (allErrors.length > 100) {
    console.error(`  ... and ${allErrors.length - 100} more`)
  }
  process.exit(1)
}

console.log(`OK: ${targets.length === 1 && statSync(targets[0]).isDirectory() ? walkMd(targets[0]).length : targets.filter((t) => t.endsWith('.md')).length || walkMd(ROOT).length} file(s) compliant`)
