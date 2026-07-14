#!/usr/bin/env node

console.error('scripts/deploy/sync-and-deploy.mjs is retired.')
console.error('It no longer stages, commits, pushes, or deploys production.')
console.error('Use `npm run repo:sync` from a clean local main branch.')
console.error('Production is released only by an explicitly approved merge to GitHub main.')

process.exit(1)
