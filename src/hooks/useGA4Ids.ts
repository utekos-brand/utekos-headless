import { getClientGA4Data } from '@/lib/tracking/google/getClientGA4Data'

export function useGA4Ids() {
  const ga4Data = getClientGA4Data()

  return {
    client_id: ga4Data?.client_id,
    session_id: ga4Data?.session_id
  }
}
