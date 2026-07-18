import assert from 'node:assert/strict'
import test from 'node:test'
import {
  handleMetaDatasetQualityCron,
  type MetaDatasetQualityCronDependencies
} from './route'

function request(authorization?: string) {
  return new Request(
    'https://utekos.no/api/cron/meta-dataset-quality',
    authorization ? { headers: { authorization } } : undefined
  )
}

const syncResult = {
  datasetId: '1092362672918571',
  eventCount: 6,
  insertedCount: 6,
  measuredAt: '2026-07-18T21:20:00.000Z'
}

test('rejects an unauthorized Meta quality cron', async () => {
  const dependencies: MetaDatasetQualityCronDependencies = {
    getCronSecret: () => 'correct-secret',
    sync: async () => {
      throw new Error('sync must not run')
    }
  }

  const response = await handleMetaDatasetQualityCron(
    request('Bearer wrong-secret'),
    dependencies
  )

  assert.equal(response.status, 401)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('runs the authorized Meta quality sync', async () => {
  let syncCount = 0
  const dependencies: MetaDatasetQualityCronDependencies = {
    getCronSecret: () => 'correct-secret',
    sync: async () => {
      syncCount += 1
      return syncResult
    }
  }

  const response = await handleMetaDatasetQualityCron(
    request('Bearer correct-secret'),
    dependencies
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(syncCount, 1)
  assert.deepEqual(await response.json(), {
    ...syncResult,
    ok: true
  })
})
