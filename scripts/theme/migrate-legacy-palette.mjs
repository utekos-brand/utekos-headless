#!/usr/bin/env node
/**
 * Migrates legacy Utekos palette names to globals.css semantic tokens.
 */
import fs from 'node:fs'
import path from 'node:path'

const srcRoot = path.join(path.resolve(import.meta.dirname, '../..'), 'src')
const skip = new Set([
  path.join(srcRoot, 'components/shadcn-default.css')
])

const cssVarReplacements = [
  ['--color-foreground-muted', '--muted-foreground'],
  ['--foreground-muted', '--muted-foreground'],
  ['--color-havdyp-mono-900', '--card'],
  ['--color-havdyp', '--card'],
  ['--havdyp', '--card'],
  ['--color-maritime-darkest', '--card'],
  ['--color-maritime-950', '--card'],
  ['--color-maritime-900', '--card'],
  ['--color-maritime-800', '--card'],
  ['--color-maritime-100', '--muted'],
  ['--maritime-darkest', '--card'],
  ['--ancient-water', '--secondary'],
  ['--mountain-view', '--secondary'],
  ['--quiet-tide', '--secondary'],
  ['--deep-forest', '--card'],
  ['--maritime-blue', '--secondary'],
  ['--coral-green', '--ceramic'],
  ['--jungle', '--secondary'],
  ['--very-peri', '--ring'],
  ['--overcast', '--muted'],
  ['--barely-blue', '--muted-foreground'],
  ['--soft-warm', '--accent'],
  ['--orange-slice', '--primary'],
  ['--dazzle-blue', '--secondary'],
  ['--fair-orchid', '--ceramic'],
  ['--country-air', '--accent'],
  ['--skipper-blue', '--secondary'],
  ['--cloud-dancer', '--background'],
  ['--chocolate-plum', '--foreground'],
  ['--white-sand', '--background'],
  ['--pine', '--secondary'],
  ['--demitasse', '--card'],
  ['--interstellar', '--card'],
  ['--accent-primary', '--primary'],
  ['--color-ancient-water', '--secondary'],
  ['--color-mountain-view', '--secondary'],
  ['--color-quiet-tide', '--secondary'],
  ['--color-deep-forest', '--card'],
  ['--color-soft-warm', '--accent'],
  ['--color-havdyp', '--card'],
  ['--color-maritime-darkest', '--card'],
  ['--color-overcast', '--muted'],
  ['--color-very-peri', '--ring'],
  ['--color-coral-green', '--ceramic'],
  ['--color-ocean-cavern', '--card'],
  ['--color-bleached-mauve', '--ceramic'],
  ['--ocean-cavern', '--card'],
  ['--bleached-mauve', '--ceramic']
]

const utilityPrefixes = [
  'bg',
  'text',
  'border',
  'ring',
  'shadow',
  'from',
  'to',
  'via',
  'fill',
  'stroke',
  'outline',
  'decoration',
  'divide'
]

const tokenMap = {
  'foreground-muted': { default: 'muted-foreground', bg: 'muted' },
  'havdyp': { default: 'card' },
  'ancient-water': { default: 'secondary' },
  'coral-green': { default: 'ceramic' },
  'jungle': { default: 'secondary' },
  'very-peri': { default: 'ring' },
  'overcast': { default: 'muted' },
  'mountain-view': { default: 'secondary' },
  'barely-blue': { default: 'muted-foreground' },
  'soft-warm': { default: 'accent' },
  'quiet-tide': { default: 'secondary' },
  'deep-forest': { default: 'card' },
  'maritime-blue': { default: 'secondary' },
  'maritime-darkest': { default: 'card' },
  'maritime-800': { default: 'card' },
  'white-sand': { default: 'background' },
  'orange-slice': { default: 'primary' },
  'dazzle-blue': { default: 'secondary' },
  'fair-orchid': { default: 'ceramic' },
  'country-air': { default: 'accent' },
  'skipper-blue': { default: 'secondary' },
  'cloud-dancer': { default: 'background' },
  'chocolate-plum': { default: 'foreground' },
  'pine': { default: 'secondary' },
  'demitasse': { default: 'card' },
  'interstellar': { default: 'card' },
  'bleached-mauve': { default: 'ceramic' },
  'ocean-cavern': { default: 'card' }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, files)
      continue
    }
    if (!/\.(tsx?|css|mdx)$/.test(entry.name)) continue
    if (skip.has(full)) continue
    files.push(full)
  }
  return files
}

function migrateUtilities(content) {
  let next = content

  for (const [legacy, mapping] of Object.entries(tokenMap)) {
    for (const prefix of utilityPrefixes) {
      const semantic =
        prefix === 'bg' && legacy === 'foreground-muted' ?
          mapping.bg ?? mapping.default
        : mapping.default

      const legacyPattern = new RegExp(
        `(${prefix}-${legacy.replace(/-/g, '\\-')})(?=/|"|'|\\s|])`,
        'g'
      )
      next = next.replace(legacyPattern, `${prefix}-${semantic}`)
    }
  }

  return next
}

function migrateCssVars(content) {
  let next = content
  for (const [from, to] of cssVarReplacements) {
    next = next.replaceAll(from, to)
  }
  return next
}

function migrateBenefitSurfaceKeys(content) {
  return content
    .replaceAll("surface: 'dazzle'", "surface: 'muted'")
    .replaceAll("surface: 'dazzleagain'", "surface: 'mutedAlt'")
    .replaceAll("type BenefitSurface = 'dazzle' | 'orange' | 'dazzleagain'", "type BenefitSurface = 'muted' | 'accent' | 'mutedAlt'")
    .replaceAll('dazzle:', 'muted:')
    .replaceAll('dazzleagain:', 'mutedAlt:')
    .replaceAll("type BenefitTone = 'water' | 'mauve' | 'overcast'", "type BenefitTone = 'water' | 'mauve' | 'muted'")
    .replaceAll('overcast:', 'muted:')
}

let changed = 0
for (const file of walk(srcRoot)) {
  const before = fs.readFileSync(file, 'utf8')
  let next = before
  next = migrateCssVars(next)
  next = migrateUtilities(next)
  if (file.includes('BenefitCard')) {
    next = migrateBenefitSurfaceKeys(next)
  }
  if (next !== before) {
    fs.writeFileSync(file, next)
    changed += 1
  }
}

console.log(`migrate-legacy-palette: updated ${changed} files`)
