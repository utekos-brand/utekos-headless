import assert from 'node:assert/strict'
import test from 'node:test'

import { isDeadLetterReplayEnabled } from './isDeadLetterReplayEnabled'

test('isDeadLetterReplayEnabled is fail-closed by default', () => {
  assert.equal(isDeadLetterReplayEnabled({} as unknown as NodeJS.ProcessEnv), false)
  assert.equal(isDeadLetterReplayEnabled({ DEAD_LETTER_REPLAY_ENABLED: 'true' } as unknown as NodeJS.ProcessEnv), false)
  assert.equal(isDeadLetterReplayEnabled({ DEAD_LETTER_REPLAY_ENABLED: '0' } as unknown as NodeJS.ProcessEnv), false)
})

test('isDeadLetterReplayEnabled requires explicit numeric enable flag', () => {
  assert.equal(isDeadLetterReplayEnabled({ DEAD_LETTER_REPLAY_ENABLED: '1' } as unknown as NodeJS.ProcessEnv), true)
})
