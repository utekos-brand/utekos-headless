import { canonicalSelectItemSchema } from '../../selectItemEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalSelectItemToMeta } from '../dispatchCanonicalSelectItemToMeta'

export const metaSelectItemProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalSelectItemToMeta,
  eventName: 'select_item',
  key: 'meta:select_item',
  schema: canonicalSelectItemSchema
})
