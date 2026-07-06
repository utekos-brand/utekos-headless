// Path: types/tracking/meta/event/FacebookServerEvent.ts

import type { FacebookUserData } from '../FacebookUserData'

export type FacebookServerEvent = {
  setEventName(name: string): FacebookServerEvent
  setEventId(id: string): FacebookServerEvent
  setEventTime(timestamp: number): FacebookServerEvent
  setEventSourceUrl(url: string): FacebookServerEvent
  setActionSource(source: string): FacebookServerEvent
  setUserData(userData: FacebookUserData): FacebookServerEvent
  setCustomData(data: Record<string, unknown>): FacebookServerEvent
}
