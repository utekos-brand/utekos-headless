#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_VERCEL_SCOPE = 'utekos-marketing-group'
const DEFAULT_VERCEL_PROJECT = 'utekos-headless'

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function getExitCode(command, args) {
  const result = spawnSync(command, args, { stdio: 'ignore' })

  if (result.error) {
    throw result.error
  }

  return result.status ?? 1
}

function readLinkedVercelProjectName() {
  const projectPath = resolve(process.cwd(), '.vercel/project.json')

  if (!existsSync(projectPath)) {
    return DEFAULT_VERCEL_PROJECT
  }

  const project = JSON.parse(readFileSync(projectPath, 'utf8'))

  return (
    typeof project.projectName === 'string' && project.projectName.trim() ?
      project.projectName
    : DEFAULT_VERCEL_PROJECT
  )
}

function commitStagedChanges(commitMessage) {
  run('git', ['add', '.'])

  const diffExitCode = getExitCode('git', ['diff', '--cached', '--quiet'])

  if (diffExitCode === 0) {
    console.log('Nothing to commit, working tree clean.')
    return
  }

  if (diffExitCode !== 1) {
    console.error('Unable to inspect staged changes.')
    process.exit(diffExitCode)
  }

  if (!commitMessage) {
    console.error('Commit message required when there are staged changes.')
    console.error('Usage: npm run sync -- "Commit message"')
    process.exit(1)
  }

  run('git', ['commit', '-m', commitMessage])
}

function deployProduction() {
  const projectName = readLinkedVercelProjectName()
  const scope = process.env.VERCEL_SYNC_SCOPE ?? DEFAULT_VERCEL_SCOPE

  run('npx', [
    '-y',
    'vercel@latest',
    'deploy',
    '--prod',
    '--yes',
    '--archive',
    'tgz',
    '--project',
    projectName,
    '--scope',
    scope,
  ])
}

const commitMessage = process.argv.slice(2).join(' ').trim()

commitStagedChanges(commitMessage)
run('git', ['push'])
deployProduction()
