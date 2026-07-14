#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import process from 'node:process'

import {
  captureTargetEvidence,
  getGtmAccessToken,
  readJson,
  readLoaderClient,
  verifyQuickPreviewEvidence
} from './lib/gtm-publish-guard.mjs'

const execFileAsync = promisify(execFile)

async function assertGitWorktreeClean() {
  const { stdout } = await execFileAsync('git', ['status', '--porcelain', '--untracked-files=all'])
  if (stdout.trim()) throw new Error('Git worktree must be clean before GTM publish')
}

async function main() {
  if (process.env.GTM_PUBLISH_CONFIRM !== 'I_APPROVE_GTM_PUBLISH') {
    throw new Error('GTM_PUBLISH_CONFIRM=I_APPROVE_GTM_PUBLISH is required')
  }
  const evidencePath = process.env.GTM_QUICK_PREVIEW_EVIDENCE
  if (!evidencePath) throw new Error('GTM_QUICK_PREVIEW_EVIDENCE must point to API-generated evidence')

  await assertGitWorktreeClean()
  const baseline = readJson(process.env.GTM_GUARD_BASELINE || 'config/gtm/sgtm-remediation-baseline.json')
  const evidence = readJson(evidencePath)
  if (evidence.schemaVersion !== 1) throw new Error('Unsupported GTM evidence schema version')

  const accessToken = await getGtmAccessToken()
  const generatedAt = new Date().toISOString()
  const [webCurrent, serverCurrent, loaderClient] = await Promise.all([
    captureTargetEvidence(accessToken, baseline.web, generatedAt),
    captureTargetEvidence(accessToken, baseline.server, generatedAt),
    readLoaderClient(accessToken, baseline.server)
  ])

  verifyQuickPreviewEvidence({ evidence: evidence.web, target: baseline.web, now: Date.now(), currentEvidence: webCurrent })
  verifyQuickPreviewEvidence({ evidence: evidence.server, target: baseline.server, now: Date.now(), currentEvidence: serverCurrent })

  if (loaderClient.type !== baseline.server.loaderClient.type
    || loaderClient.fingerprint !== baseline.server.loaderClient.fingerprint) {
    throw new Error('Production loader client 6 invariant failed')
  }

  console.log(JSON.stringify({
    ok: true,
    web: { liveVersion: baseline.web.liveVersion, resourceDigest: webCurrent.resourceDigest },
    server: { liveVersion: baseline.server.liveVersion, resourceDigest: serverCurrent.resourceDigest },
    loaderClientInvariant: true
  }, null, 2))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
