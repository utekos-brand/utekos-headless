import assert from 'node:assert/strict'
import test from 'node:test'
import {
  syncMetaDatasetQuality,
  type MetaDatasetQualitySyncDependencies
} from './syncMetaDatasetQuality'

test('stores one validated daily snapshot batch', async () => {
  const measuredAt = new Date('2026-07-18T21:20:00.000Z')
  const insertedInputs: unknown[] = []
  const dependencies: MetaDatasetQualitySyncDependencies = {
    fetchQuality: async () => ({
      web: [
        {
          event_match_quality: { composite_score: 9.3 },
          event_name: 'Purchase'
        }
      ]
    }),
    getConfig: () => ({
      accessToken: 'secret-token',
      datasetId: '1092362672918571'
    }),
    getNow: () => measuredAt,
    insertSnapshot: async input => {
      insertedInputs.push(input)
      return 1
    }
  }

  const result = await syncMetaDatasetQuality(dependencies)

  assert.deepEqual(result, {
    datasetId: '1092362672918571',
    eventCount: 1,
    insertedCount: 1,
    measuredAt: '2026-07-18T21:20:00.000Z'
  })
  assert.equal(insertedInputs.length, 1)
})
