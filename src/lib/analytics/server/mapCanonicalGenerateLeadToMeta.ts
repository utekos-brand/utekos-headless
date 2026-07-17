import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalGenerateLead } from '../generateLeadEvent'
import { mapCanonicalLeadToMeta } from './mapCanonicalLeadToMeta'

export function mapCanonicalGenerateLeadToMeta(
  event: CanonicalGenerateLead
): ServerEvent {
  return mapCanonicalLeadToMeta(event)
}
