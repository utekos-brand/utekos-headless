import assert from 'node:assert/strict'
import test from 'node:test'

test('emits the same non-identifying signal for free text, email, phone and query secrets', async () => {
  let searchModule: Record<string, unknown> = {}
  try {
    searchModule = await import('./buildSafeSearchEventData') as Record<string, unknown>
  } catch {}

  const buildSafeSearchEventData = searchModule.buildSafeSearchEventData
  assert.equal(typeof buildSafeSearchEventData, 'function')

  const build = buildSafeSearchEventData as () => Record<string, unknown>
  const inputs = [
    'utekos',
    'kunde@example.com',
    '+47 999 99 999',
    'token=very-secret&email=kunde@example.com'
  ]
  assert.equal(build.length, 0)
  const outputs = inputs.map(() => build())

  assert.ok(outputs.every(output => JSON.stringify(output) === JSON.stringify(outputs[0])))
  assert.deepEqual(outputs[0], {
    content_category: 'site_search',
    search_string: 'submitted'
  })

  const serialized = JSON.stringify(outputs)
  assert.doesNotMatch(serialized, /kunde@example\.com|999|very-secret|utekos/)
})
