import type { CanonicalSearch } from '../searchEvent'
import { createCanonicalMetaDispatch } from './createCanonicalMetaDispatch'
import { mapCanonicalSearchToMeta } from './mapCanonicalSearchToMeta'

export const dispatchCanonicalSearchToMeta =
  createCanonicalMetaDispatch<CanonicalSearch, 'search'>({
    eventName: 'search',
    mapEvent: mapCanonicalSearchToMeta
  })
