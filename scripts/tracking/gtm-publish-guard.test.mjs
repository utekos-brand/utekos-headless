import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  buildQuickPreviewEvidence,
  canonicalizeWorkspaceChanges,
  verifyQuickPreviewEvidence
} from './lib/gtm-publish-guard.mjs'

const target = {
  accountId: '1',
  containerId: '2',
  workspaceId: '3',
  liveVersion: '108',
  liveFingerprint: 'live-fingerprint',
  expectedChanges: [
    { changeStatus: 'updated', kind: 'tag', id: '109', name: 'Google tag' },
    { changeStatus: 'added', kind: 'variable', name: 'DLV - event_id' }
  ]
}

test('documents a JSON-only evidence capture command and the current guard contract', () => {
  const desired = JSON.parse(fs.readFileSync('config/gtm/sgtm-remediation-desired.json', 'utf8'))
  assert.match(desired.publishGuard.evidenceCommand, /npm run --silent tracking:gtm-quick-preview:capture/)
  assert.equal(
    desired.publishGuard.guardCommand,
    'GTM_PUBLISH_CONFIRM=I_APPROVE_GTM_PUBLISH GTM_QUICK_PREVIEW_EVIDENCE=/tmp/utekos-gtm-quick-preview.json npm run tracking:gtm-publish-guard'
  )
})

const status = {
  workspaceChange: [
    { variable: { variableId: '141', name: 'DLV - event_id' }, changeStatus: 'added' },
    { tag: { tagId: '109', name: 'Google tag' }, changeStatus: 'updated' }
  ]
}

const preview = {
  compilerError: false,
  syncStatus: { mergeConflict: false, syncError: false },
  containerVersion: {
    tag: [{ tagId: '109', name: 'Google tag', fingerprint: 'volatile' }],
    variable: [{ variableId: '141', name: 'DLV - event_id' }]
  }
}

test('canonicalizes the exact GTM change set independent of API ordering', () => {
  assert.deepEqual(canonicalizeWorkspaceChanges(status), [
    { changeStatus: 'added', kind: 'variable', id: '141', name: 'DLV - event_id' },
    { changeStatus: 'updated', kind: 'tag', id: '109', name: 'Google tag' }
  ])
})

test('builds evidence from the real quick-preview response and resource digest', () => {
  const evidence = buildQuickPreviewEvidence({
    generatedAt: '2026-07-13T10:00:00.000Z',
    target,
    workspaceFingerprint: 'workspace-fingerprint',
    live: { containerVersionId: '108', fingerprint: 'live-fingerprint' },
    status,
    preview
  })

  assert.equal(evidence.source, 'tagmanager.googleapis.com/workspaces.quick_preview')
  assert.equal(evidence.compilerError, false)
  assert.deepEqual(evidence.syncStatus, { mergeConflict: false, syncError: false })
  assert.match(evidence.resourceDigest, /^[a-f0-9]{64}$/)
  assert.equal(evidence.workspaceChanges.length, target.expectedChanges.length)
})

test('rejects stale, handwritten, drifted or compiler-error evidence', () => {
  const evidence = buildQuickPreviewEvidence({
    generatedAt: '2026-07-13T10:00:00.000Z',
    target,
    workspaceFingerprint: 'workspace-fingerprint',
    live: { containerVersionId: '108', fingerprint: 'live-fingerprint' },
    status,
    preview
  })

  assert.throws(() => verifyQuickPreviewEvidence({
    evidence: { ...evidence, source: 'handwritten' },
    target,
    now: Date.parse('2026-07-13T10:10:00.000Z'),
    currentEvidence: evidence
  }), /source/)
  assert.throws(() => verifyQuickPreviewEvidence({
    evidence,
    target,
    now: Date.parse('2026-07-13T11:01:00.000Z'),
    currentEvidence: evidence
  }), /one hour/)
  assert.throws(() => verifyQuickPreviewEvidence({
    evidence,
    target,
    now: Date.parse('2026-07-13T10:10:00.000Z'),
    currentEvidence: { ...evidence, resourceDigest: '0'.repeat(64) }
  }), /resource digest/)
  assert.throws(() => verifyQuickPreviewEvidence({
    evidence: { ...evidence, compilerError: true },
    target,
    now: Date.parse('2026-07-13T10:10:00.000Z'),
    currentEvidence: { ...evidence, compilerError: true }
  }), /compiler/)
})

test('resource digests sort only top-level entity arrays and preserve nested parameter order', () => {
  const first = buildQuickPreviewEvidence({
    generatedAt: '2026-07-13T10:00:00.000Z', target,
    workspaceFingerprint: 'workspace-fingerprint',
    live: { containerVersionId: '108', fingerprint: 'live-fingerprint' }, status,
    preview: { ...preview, containerVersion: { tag: [
      { tagId: '2', name: 'B', parameter: [{ key: 'first' }, { key: 'second' }] },
      { tagId: '1', name: 'A' }
    ] } }
  })
  const topLevelReordered = buildQuickPreviewEvidence({
    generatedAt: '2026-07-13T10:00:00.000Z', target,
    workspaceFingerprint: 'workspace-fingerprint',
    live: { containerVersionId: '108', fingerprint: 'live-fingerprint' }, status,
    preview: { ...preview, containerVersion: { tag: [
      { tagId: '1', name: 'A' },
      { tagId: '2', name: 'B', parameter: [{ key: 'first' }, { key: 'second' }] }
    ] } }
  })
  const nestedReordered = buildQuickPreviewEvidence({
    generatedAt: '2026-07-13T10:00:00.000Z', target,
    workspaceFingerprint: 'workspace-fingerprint',
    live: { containerVersionId: '108', fingerprint: 'live-fingerprint' }, status,
    preview: { ...preview, containerVersion: { tag: [
      { tagId: '1', name: 'A' },
      { tagId: '2', name: 'B', parameter: [{ key: 'second' }, { key: 'first' }] }
    ] } }
  })

  assert.equal(first.resourceDigest, topLevelReordered.resourceDigest)
  assert.notEqual(first.resourceDigest, nestedReordered.resourceDigest)
})
