import type { CanonicalViewItem } from '../viewItemEvent'
import {
  dispatchCanonicalViewItemToGoogleDataManager,
  type GoogleDataManagerViewItemDispatchReceipt
} from './dispatchCanonicalViewItemToGoogleDataManager'
import { processProviderOutboxAttempt } from './processProviderOutboxAttempt'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import type { ProviderAttemptOutcome } from './providerOutboxTypes'

export type GoogleDataManagerViewItemAttempt = {
  attemptCount: number
  attemptId: string
  event: CanonicalViewItem
}

export type GoogleDataManagerViewItemAttemptOutcome =
  ProviderAttemptOutcome<GoogleDataManagerViewItemDispatchReceipt>

export type GoogleDataManagerViewItemAttemptDependencies = {
  dispatch: typeof dispatchCanonicalViewItemToGoogleDataManager
  now: () => number
  random: () => number
}

const defaultDependencies: GoogleDataManagerViewItemAttemptDependencies = {
  dispatch: dispatchCanonicalViewItemToGoogleDataManager,
  now: Date.now,
  random: Math.random
}

export function processGoogleDataManagerViewItemAttempt(
  attempt: GoogleDataManagerViewItemAttempt,
  dependencies: GoogleDataManagerViewItemAttemptDependencies =
    defaultDependencies
): Promise<GoogleDataManagerViewItemAttemptOutcome> {
  return processProviderOutboxAttempt(
    attempt,
    {
      ...googleDataManagerViewItemProviderAdapter,
      dispatch: dependencies.dispatch
    },
    { now: dependencies.now, random: dependencies.random }
  )
}
