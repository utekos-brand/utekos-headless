#!/usr/bin/env node
/**
 * Migrates legacy token class names to globals.css semantic tokens.
 * Removes dark-* utility pairs; .dark redefines the same CSS variables.
 */
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../..')
const srcRoot = path.join(repoRoot, 'src')
const skipFiles = new Set([
  path.join(srcRoot, 'components/shadcn-default.css')
])

const tokenRoots = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'primary-hover',
  'primary-active',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring'
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, files)
      continue
    }
    if (!/\.(tsx?|css)$/.test(entry.name)) continue
    if (skipFiles.has(full)) continue
    files.push(full)
  }
  return files
}

function migrateContent(content) {
  let next = content

  for (const token of tokenRoots) {
    const semantic = token
    const legacy = `dark-${token}`
    const utilities = [
      'bg',
      'text',
      'border',
      'ring',
      'fill',
      'stroke',
      'from',
      'to',
      'via',
      'outline',
      'decoration',
      'divide'
    ]

    for (const util of utilities) {
      const semClass = `${util}-${semantic}`
      const legClass = `${util}-${legacy}`

      next = next.replaceAll(
        new RegExp(`${semClass} dark:${legClass}`, 'g'),
        semClass
      )
      next = next.replaceAll(
        new RegExp(`dark:${legClass} ${semClass}`, 'g'),
        semClass
      )
      next = next.replaceAll(
        new RegExp(`dark:${legClass}`, 'g'),
        semClass
      )
    }
  }

  const commercePairs = [
    ['bg-commerce-primary', 'bg-primary'],
    ['text-commerce-primary-foreground', 'text-primary-foreground'],
    ['hover:bg-commerce-primary-hover', 'hover:bg-primary-hover'],
    ['hover:text-commerce-primary-hover-foreground', 'hover:text-primary-foreground'],
    ['bg-commerce-secondary', 'bg-secondary'],
    ['text-commerce-secondary-foreground', 'text-secondary-foreground'],
    ['border-commerce-secondary', 'border-secondary'],
    ['hover:bg-commerce-secondary-hover', 'hover:bg-secondary/90'],
    ['hover:text-commerce-secondary-hover-foreground', 'hover:text-secondary-foreground'],
    ['bg-promo', 'bg-accent'],
    ['text-promo-foreground', 'text-accent-foreground'],
    ['border-promo-foreground', 'border-accent-foreground'],
    ['bg-featured', 'bg-secondary'],
    ['text-featured-foreground', 'text-secondary-foreground'],
    ['border-featured-border', 'border-border'],
    ["tone='commerce-primary'", "tone='neutral'"],
    ['tone="commerce-primary"', 'tone="neutral"'],
    ["tone='commerce-secondary'", "tone='secondary'"],
    ['tone="commerce-secondary"', 'tone="secondary"'],
    ["variant='commerce-primary'", "variant='default'"],
    ['variant="commerce-primary"', 'variant="default"'],
    ["variant='commerce-secondary'", "variant='secondary'"],
    ['variant="commerce-secondary"', 'variant="secondary"']
  ]

  for (const [from, to] of commercePairs) {
    next = next.replaceAll(from, to)
  }

  next = next.replaceAll('var(--promo-foreground)', 'var(--accent-foreground)')
  next = next.replaceAll('var(--promo)', 'var(--accent)')
  next = next.replaceAll('var(--commerce-primary)', 'var(--primary)')
  next = next.replaceAll(
    'var(--commerce-primary-foreground)',
    'var(--primary-foreground)'
  )
  next = next.replaceAll('var(--commerce-secondary)', 'var(--secondary)')
  next = next.replaceAll(
    'var(--commerce-secondary-foreground)',
    'var(--secondary-foreground)'
  )
  next = next.replaceAll('var(--featured)', 'var(--secondary)')
  next = next.replaceAll(
    'var(--featured-foreground)',
    'var(--secondary-foreground)'
  )

  // dark:hover:bg-dark-background → hover:bg-background
  next = next.replace(
    /dark:((?:[\w\[\]-]+:)*[\w-]+(?:\/[\d.]+)?)/g,
    (match, cls) => {
      if (!cls.includes('-dark-')) return match
      return cls.replace(/-dark-/g, '-')
    }
  )

  // ring-offset-dark-background → ring-offset-background
  next = next.replace(/-dark-([\w-]+)/g, '-$1')

  return next
}

const files = walk(srcRoot)
let changed = 0

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8')
  const after = migrateContent(before)
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed += 1
  }
}

console.log(`migrate-globals-tokens: updated ${changed} files`)
