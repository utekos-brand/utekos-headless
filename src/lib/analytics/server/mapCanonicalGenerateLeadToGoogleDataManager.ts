import type { CanonicalGenerateLead } from '../generateLeadEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalGenerateLeadToGoogleDataManager(
  event: CanonicalGenerateLead
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'generate_lead')
}
