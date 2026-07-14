import type { MetaEventData } from 'types/tracking/meta/event'

export function buildSafeSearchEventData(): MetaEventData {
  return {
    content_category: 'site_search',
    search_string: 'submitted'
  }
}
