import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'sync-main.mjs')

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8'
  })

  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`
  )

  return result.stdout.trim()
}

function runSync(cwd) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd,
    encoding: 'utf8'
  })
}

function createRepository() {
  const root = mkdtempSync(join(tmpdir(), 'utekos-sync-main-'))
  const remote = join(root, 'remote.git')
  const work = join(root, 'work')

  run('git', ['init', '--bare', '--initial-branch=main', remote], root)
  run('git', ['clone', remote, work], root)
  run('git', ['config', 'user.email', 'sync-main-test@utekos.no'], work)
  run('git', ['config', 'user.name', 'Utekos sync-main test'], work)
  writeFileSync(join(work, 'README.md'), 'initial\n')
  run('git', ['add', 'README.md'], work)
  run('git', ['commit', '-m', 'initial'], work)
  run('git', ['push', '--set-upstream', 'origin', 'main'], work)

  return { root, remote, work }
}

function removeRepository(root) {
  rmSync(root, { recursive: true, force: true })
}

test('accepts a clean main branch that already matches origin/main', () => {
  const repository = createRepository()

  try {
    const result = runSync(repository.work)

    assert.equal(result.status, 0)
    assert.match(result.stdout, /already matches origin\/main/)
    assert.match(result.stdout, /No commit, push, merge, or Vercel deployment/)
  } finally {
    removeRepository(repository.root)
  }
})

test('fast-forwards a clean main branch that is behind origin/main', () => {
  const repository = createRepository()
  const peer = join(repository.root, 'peer')

  try {
    run('git', ['clone', repository.remote, peer], repository.root)
    run('git', ['config', 'user.email', 'sync-main-test@utekos.no'], peer)
    run('git', ['config', 'user.name', 'Utekos sync-main test'], peer)
    writeFileSync(join(peer, 'remote-change.md'), 'remote\n')
    run('git', ['add', 'remote-change.md'], peer)
    run('git', ['commit', '-m', 'remote change'], peer)
    run('git', ['push', 'origin', 'main'], peer)

    const result = runSync(repository.work)

    assert.equal(result.status, 0)
    assert.match(result.stdout, /now matches origin\/main/)
    assert.equal(
      run('git', ['rev-parse', 'main'], repository.work),
      run('git', ['rev-parse', 'origin/main'], repository.work)
    )
  } finally {
    removeRepository(repository.root)
  }
})

test('refuses a dirty main branch without changing the work', () => {
  const repository = createRepository()

  try {
    writeFileSync(join(repository.work, 'pending.md'), 'intentional\n')

    const result = runSync(repository.work)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /dirty main branch/)
    assert.match(run('git', ['status', '--short'], repository.work), /pending\.md/)
  } finally {
    removeRepository(repository.root)
  }
})

test('refuses to sync a candidate branch', () => {
  const repository = createRepository()

  try {
    run('git', ['switch', '-c', 'codex/candidate'], repository.work)

    const result = runSync(repository.work)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Refusing to sync codex\/candidate/)
  } finally {
    removeRepository(repository.root)
  }
})

test('refuses to push a local main branch that is ahead of origin/main', () => {
  const repository = createRepository()

  try {
    writeFileSync(join(repository.work, 'local-only.md'), 'local\n')
    run('git', ['add', 'local-only.md'], repository.work)
    run('git', ['commit', '-m', 'local only'], repository.work)
    const remoteRevisionBefore = run('git', ['rev-parse', 'origin/main'], repository.work)

    const result = runSync(repository.work)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Local main is ahead of origin\/main/)
    run('git', ['fetch', 'origin'], repository.work)
    assert.equal(
      run('git', ['rev-parse', 'origin/main'], repository.work),
      remoteRevisionBefore
    )
  } finally {
    removeRepository(repository.root)
  }
})
