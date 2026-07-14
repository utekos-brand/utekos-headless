import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationPath = new URL(
  '../../../../supabase/migrations/20260712120000_add_tagging_observations_and_verified_dispatch_status.sql',
  import.meta.url
)

test('keeps tagging observations append-only and service-role-only', async () => {
  const migration = await readFile(migrationPath, 'utf8')

  assert.match(migration, /force row level security/i)
  assert.match(migration, /revoke all[^;]+from public, anon, authenticated, service_role/i)
  assert.match(migration, /grant select, insert[^;]+to service_role/i)
  assert.doesNotMatch(migration, /grant[^;]+(?:update|delete)[^;]+tagging_observations/i)
  assert.match(migration, /grant usage on schema ops to service_role/i)
  assert.doesNotMatch(migration, /revoke all on schema ops/i)
})

test('enforces observation-specific fields at the database boundary', async () => {
  const migration = await readFile(migrationPath, 'utf8')

  assert.match(migration, /tagging_observations_shape_check/i)
  assert.match(migration, /observation_type = 'browser_dispatch'[^;]+container_id is null/is)
  assert.match(migration, /observation_type = 'sgtm_ingress'[^;]+container_id is not null/is)
  assert.match(migration, /observation_type = 'tag_execution'[^;]+tag_id is not null[^;]+tag_status is not null/is)
})
