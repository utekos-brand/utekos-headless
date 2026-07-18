import type { CanonicalPageView } from '../pageViewEvent'
import { createCanonicalMetaDispatch } from './createCanonicalMetaDispatch'
import { mapCanonicalPageViewToMeta } from './mapCanonicalPageViewToMeta'

export const dispatchCanonicalPageViewToMeta =
  createCanonicalMetaDispatch<CanonicalPageView, 'page_view'>({
    eventName: 'page_view',
    mapEvent: mapCanonicalPageViewToMeta
  })
