#!/usr/bin/env node
/** Removes legacy commerce/promo utility duplicates left after token migration. */
import fs from 'node:fs'
import path from 'node:path'

const srcRoot = path.join(path.resolve(import.meta.dirname, '../..'), 'src')
const skip = new Set([path.join(srcRoot, 'components/shadcn-default.css')])

const removals = [
  ' bg-commerce-primary',
  ' text-commerce-primary-foreground',
  ' hover:bg-commerce-primary-hover',
  ' hover:text-commerce-primary-hover-foreground',
  ' border-commerce-primary',
  ' focus-visible:outline-commerce-primary-foreground',
  ' bg-commerce-secondary',
  ' text-commerce-secondary-foreground',
  ' border-commerce-secondary',
  ' hover:bg-commerce-secondary-hover',
  ' hover:text-commerce-secondary-hover-foreground',
  ' bg-promo',
  ' text-promo-foreground',
  ' border-promo-foreground/',
  ' bg-promo-foreground',
  ' text-promo ',
  ' hover:border-commerce-primary/',
  ' text-commerce-primary text-commerce-primary',
  ' hover:text-primary hover:text-primary',
  ' hover:bg-primary-hover hover:bg-primary-hover',
  ' text-destructive-foreground bg-destructive',
  ' border-background/12 border-background/12',
  ' text-background text-background',
  ' hover:text-background hover:text-background',
  ' focus-visible:ring-background/50 focus-visible:ring-background/50',
  ' focus-visible:ring-offset-foreground focus-visible:ring-offset-foreground',
  ' text-foreground/55 /55',
  ' text-foreground/85 /85',
  ' text-background/55 text-background/55',
  ' text-background/85 text-background/85',
  ' border-accent-foreground/20 border-promo-foreground/20',
  ' bg-accent bg-promo',
  ' text-accent-foreground text-promo-foreground',
  ' bg-accent-foreground bg-promo-foreground',
  ' text-promo text-promo',
  ' border-secondary border-commerce-secondary',
  ' bg-secondary bg-commerce-secondary',
  ' text-secondary-foreground text-commerce-secondary-foreground',
  ' hover:bg-secondary-hover hover:bg-commerce-secondary-hover',
  ' hover:text-secondary-foreground hover:text-commerce-secondary-hover-foreground',
  ' focus-visible:ring-primary/50 focus-visible:ring-primary/50',
  ' focus-visible:ring-offset-background focus-visible:ring-offset-background',
  ' hover:text-primary focus-visible:ring-primary/50',
  ' bg-primary-foreground/40 bg-commerce-primary-foreground/40'
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
    if (skip.has(full)) continue
    files.push(full)
  }
  return files
}

let changed = 0
for (const file of walk(srcRoot)) {
  const before = fs.readFileSync(file, 'utf8')
  let next = before
  for (const remove of removals) {
    next = next.replaceAll(remove, '')
  }
  next = next.replaceAll('svg]:', '[&>svg]:')
  if (next !== before) {
    fs.writeFileSync(file, next)
    changed += 1
  }
}

console.log(`cleanup-legacy-token-duplicates: updated ${changed} files`)
