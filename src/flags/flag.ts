// flags.ts
// demo
import { postHogAdapter } from '@flags-sdk/posthog'
import { flag, dedupe } from 'flags/next'
import type { Identify } from 'flags'

export const identify = dedupe(async () => ({
  distinctId: 'user_distinct_id' // replace with real user ID
})) satisfies Identify<{ distinctId: string }>

export const myFlag = flag({
  key: 'my-flag',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify
})
