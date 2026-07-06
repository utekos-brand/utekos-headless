#!/usr/bin/env node
/**
 * Repairs class strings broken by aggressive token migration.
 */
import fs from 'node:fs'
import path from 'node:path'

const srcRoot = path.join(path.resolve(import.meta.dirname, '../..'), 'src')

const replacements = [
  ['leading-text-paragraph /', 'leading-text-paragraph text-foreground/'],
  ['shrink-0-ancient-water', 'shrink-0 text-secondary'],
  ['leading-tighttracking-normal', 'leading-tight tracking-normal'],
  ['accent-primary accent-primary', 'accent-primary'],
  [
    'focus-visible:outline-primary focus-visible:outline-primary',
    'focus-visible:outline-primary'
  ],
  ['border-background/5 border-background/5', 'border-background/5'],
  ['ring-primary/20 ring-primary/20', 'ring-primary/20'],
  ['bg-background/72 bg-background/72', 'bg-background/72'],
  ['text-background/85 text-background/85', 'text-background/85'],
  ['text-background/82 text-background/82', 'text-background/82'],
  ['text-background/80 text-background/80', 'text-background/80'],
  ['text-background/90 text-background/90', 'text-background/90'],
  ['text-background/75 text-background/75', 'text-background/75'],
  ['text-background/68 text-background/68', 'text-background/68'],
  ['bg-background leading-text-paragraph', 'bg-background leading-text-paragraph'],
  ['border-foreground/15  rounded-2xl', 'rounded-2xl border-foreground/15'],
  ['bg-foreground/5 /90', 'bg-foreground/5 text-foreground/90'],
  ['text-primary text-primary', 'text-primary'],
  ['border-border bg-background', 'border-border bg-background']
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, files)
      continue
    }
    if (!/\.(tsx?|css|mdx)$/.test(entry.name)) continue
    files.push(full)
  }
  return files
}

let updated = 0
for (const file of walk(srcRoot)) {
  let content = fs.readFileSync(file, 'utf8')
  let next = content
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to)
  }
  if (next !== content) {
    fs.writeFileSync(file, next)
    updated++
  }
}

console.log(`fix-migration-corruption: updated ${updated} files`)
