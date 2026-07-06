// Path: types/tracking/meta/event/FacebookEventRequest.ts

import type { FacebookServerEvent } from './FacebookServerEvent'
import type { MetaEventResponse } from './MetaEventResponse'
export type FacebookEventRequest = {
  setEvents(events: FacebookServerEvent[]): FacebookEventRequest
  execute(): Promise<MetaEventResponse>
}
