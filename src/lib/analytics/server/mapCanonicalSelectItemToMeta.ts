import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalSelectItem } from '../selectItemEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalSelectItemToMeta(
  event: CanonicalSelectItem
): ServerEvent {
  return mapCanonicalCommerceEventToMeta(event, 'SelectItem')
}
