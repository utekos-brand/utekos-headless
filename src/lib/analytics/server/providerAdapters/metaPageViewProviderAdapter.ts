import { canonicalPageViewSchema } from '../../pageViewEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalPageViewToMeta } from '../dispatchCanonicalPageViewToMeta'

const META_PAGE_VIEW_OUTBOX_CUTOVER =
  '2026-07-18T13:13:10.000Z'

export const metaPageViewProviderAdapter =
  createMetaProviderAdapter({
    claimNotBefore: META_PAGE_VIEW_OUTBOX_CUTOVER,
    dispatch: dispatchCanonicalPageViewToMeta,
    eventName: 'page_view',
    key: 'meta:page_view',
    schema: canonicalPageViewSchema
  })
