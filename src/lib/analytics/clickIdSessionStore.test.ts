import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLICK_ID_SESSION_KEY,
  resolveClickIds
} from './clickIdSessionStore'

function createMemoryStorage(initial?: Record<string, string>) {
  const store = new Map<string, string>(Object.entries(initial ?? {}))

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
    dump() {
      return Object.fromEntries(store)
    }
  }
}

test('resolveClickIds reads click identifiers from the URL', () => {
  assert.deepEqual(
    resolveClickIds(
      'https://utekos.no/?gclid=google-1&fbclid=meta-1&unknown=no',
      createMemoryStorage()
    ),
    { gclid: 'google-1', fbclid: 'meta-1' }
  )
})

test('resolveClickIds persists URL click IDs into session storage', () => {
  const storage = createMemoryStorage()

  resolveClickIds(
    'https://utekos.no/?fbclid=meta-persist',
    storage
  )

  assert.equal(
    storage.getItem(CLICK_ID_SESSION_KEY),
    JSON.stringify({ fbclid: 'meta-persist' })
  )
})

test('resolveClickIds merges session click IDs when URL has none', () => {
  const storage = createMemoryStorage({
    [CLICK_ID_SESSION_KEY]: JSON.stringify({
      fbclid: 'meta-session',
      gclid: 'google-session'
    })
  })

  assert.deepEqual(
    resolveClickIds('https://utekos.no/skreddersy-varmen', storage),
    { fbclid: 'meta-session', gclid: 'google-session' }
  )
})

test('resolveClickIds lets fresh URL values win over session', () => {
  const storage = createMemoryStorage({
    [CLICK_ID_SESSION_KEY]: JSON.stringify({
      fbclid: 'old-meta',
      gclid: 'keep-google'
    })
  })

  assert.deepEqual(
    resolveClickIds(
      'https://utekos.no/?fbclid=new-meta',
      storage
    ),
    { fbclid: 'new-meta', gclid: 'keep-google' }
  )
})
