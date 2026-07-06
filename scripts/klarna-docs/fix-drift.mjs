#!/usr/bin/env node
import { readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT } from './lib/constants.mjs'

const typoPath = join(
  ROOT,
  'dev/docs/markdown/latest-official/on-site-messaging/migration-to-the-new-klarna-websdk.md.md'
)
const fixedPath = join(
  ROOT,
  'dev/docs/markdown/latest-official/on-site-messaging/migration-to-the-new-klarna-websdk.md'
)

if (statSync(typoPath, { throwIfNoEntry: false })) {
  renameSync(typoPath, fixedPath)
  console.log('renamed: migration-to-the-new-klarna-websdk.md.md → .md')
} else {
  console.log('skip rename: typo file not present')
}
