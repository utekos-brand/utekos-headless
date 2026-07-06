// Path: types/tracking/meta/event/MetaEventRequestBody.ts

export type MetaEventRequestBody = {
  event_name: string
  event_id: string
  event_source_url: string
  custom_data?: Record<string, unknown>
}
