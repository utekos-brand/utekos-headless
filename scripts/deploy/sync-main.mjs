#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

const PRODUCTION_BRANCH = 'main'
const PRODUCTION_REMOTE = 'origin'
const PRODUCTION_REMOTE_REF = `${PRODUCTION_REMOTE}/${PRODUCTION_BRANCH}`

function runGit(args, { inherit = false } = {}) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe'
  })

  if (result.error) {
    throw result.error
  }

  return result
}

function readGit(args, errorMessage) {
  const result = runGit(args)

  if (result.status !== 0) {
    fail(errorMessage, result.stderr)
  }

  return result.stdout.trim()
}

function isAncestor(ancestor, descendant) {
  return runGit(['merge-base', '--is-ancestor', ancestor, descendant]).status === 0
}

function fail(message, detail = '') {
  console.error(message)

  if (detail.trim()) {
    console.error(detail.trim())
  }

  process.exit(1)
}

readGit(['rev-parse', '--show-toplevel'], 'Run this command inside the Utekos Git repository.')

const currentBranch = readGit(
  ['branch', '--show-current'],
  'Unable to determine the current Git branch.'
)

if (currentBranch !== PRODUCTION_BRANCH) {
  fail(
    `Refusing to sync ${currentBranch || 'a detached HEAD'}. `
      + `Switch to a clean ${PRODUCTION_BRANCH} branch first.`
  )
}

const workingTreeStatus = readGit(
  ['status', '--porcelain=v1', '--untracked-files=normal'],
  'Unable to inspect the working tree.'
)

if (workingTreeStatus) {
  fail(
    'Refusing to sync a dirty main branch. Commit the intentional work on a named candidate branch first.'
  )
}

readGit(
  ['remote', 'get-url', PRODUCTION_REMOTE],
  `The ${PRODUCTION_REMOTE} remote is not configured.`
)

const fetchResult = runGit(['fetch', '--prune', PRODUCTION_REMOTE], { inherit: true })

if (fetchResult.status !== 0) {
  fail(`Unable to fetch ${PRODUCTION_REMOTE}.`)
}

const localRevision = readGit(
  ['rev-parse', PRODUCTION_BRANCH],
  `Unable to resolve local ${PRODUCTION_BRANCH}.`
)
const remoteRevision = readGit(
  ['rev-parse', PRODUCTION_REMOTE_REF],
  `Unable to resolve ${PRODUCTION_REMOTE_REF}.`
)

if (localRevision === remoteRevision) {
  console.log(`${PRODUCTION_BRANCH} already matches ${PRODUCTION_REMOTE_REF} at ${localRevision}.`)
  console.log('No commit, push, merge, or Vercel deployment was performed.')
  process.exit(0)
}

if (isAncestor(PRODUCTION_BRANCH, PRODUCTION_REMOTE_REF)) {
  const mergeResult = runGit(['merge', '--ff-only', PRODUCTION_REMOTE_REF], { inherit: true })

  if (mergeResult.status !== 0) {
    fail(`Unable to fast-forward ${PRODUCTION_BRANCH} to ${PRODUCTION_REMOTE_REF}.`)
  }

  const syncedRevision = readGit(
    ['rev-parse', PRODUCTION_BRANCH],
    `Unable to verify local ${PRODUCTION_BRANCH} after fast-forward.`
  )

  if (syncedRevision !== remoteRevision) {
    fail(`${PRODUCTION_BRANCH} still differs from ${PRODUCTION_REMOTE_REF} after fast-forward.`)
  }

  console.log(`${PRODUCTION_BRANCH} now matches ${PRODUCTION_REMOTE_REF} at ${syncedRevision}.`)
  console.log('No commit, push, merge, or Vercel deployment was performed.')
  process.exit(0)
}

if (isAncestor(PRODUCTION_REMOTE_REF, PRODUCTION_BRANCH)) {
  fail(
    `Local ${PRODUCTION_BRANCH} is ahead of ${PRODUCTION_REMOTE_REF}. `
      + 'Move the commits to a named candidate branch and release them through an approved pull request.'
  )
}

fail(
  `Local ${PRODUCTION_BRANCH} and ${PRODUCTION_REMOTE_REF} have diverged. `
    + 'Resolve the candidate commits explicitly; this command will not merge, rebase, push, or discard them.'
)
