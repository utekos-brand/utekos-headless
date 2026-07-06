// Path: types/tracking/meta/event/MetaEvent.ts

import type { MetaUserData } from '../MetaUserData'
import type { MetaPurchaseCustomData } from 'types/tracking/meta/MetaPurchaseCustomData'

export type MetaEvent = {
  event_name: 'Purchase'
  event_time: number
  action_source: 'website'
  user_data: MetaUserData
  custom_data: MetaPurchaseCustomData
  event_id?: string | undefined
  event_source_url?: string | undefined
}
