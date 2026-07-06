// Path: types/tracking/webhook/ValidationResult.ts

import type { MetaEventPayload } from 'types/tracking/meta/event/MetaEventPayload'
import type { NextResponse } from 'next/server'

export type ValidationResult =
  | { success: true; payload: MetaEventPayload }
  | { success: false; errorResponse: NextResponse }
