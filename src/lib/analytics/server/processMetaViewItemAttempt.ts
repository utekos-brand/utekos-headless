import type { CanonicalViewItem } from '../viewItemEvent'
import {
  dispatchCanonicalViewItemToMeta,
  type MetaViewItemDispatchReceipt
} from './dispatchCanonicalViewItemToMeta'
import { processProviderOutboxAttempt } from './processProviderOutboxAttempt'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import type { ProviderAttemptOutcome } from './providerOutboxTypes'

export type MetaViewItemAttempt = {
  attemptCount: number
  attemptId: string
  event: CanonicalViewItem
}

export type MetaViewItemAttemptOutcome =
  ProviderAttemptOutcome<MetaViewItemDispatchReceipt>

export type MetaViewItemAttemptDependencies = {
  dispatch: typeof dispatchCanonicalViewItemToMeta
  now: () => number
}

const defaultDependencies: MetaViewItemAttemptDependencies = {
  dispatch: dispatchCanonicalViewItemToMeta,
  now: Date.now
}

export function processMetaViewItemAttempt(
  attempt: MetaViewItemAttempt,
  dependencies: MetaViewItemAttemptDependencies = defaultDependencies
): Promise<MetaViewItemAttemptOutcome> {
  return processProviderOutboxAttempt(
    attempt,
    {
      ...metaViewItemProviderAdapter,
      dispatch: dependencies.dispatch
    },
    { now: dependencies.now, random: Math.random }
  )
}
