// Path: types/tracking/webhook/WebhookResult.ts

import type { NextResponse } from 'next/server'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'

export type WebhookResult =
  | { success: true; order: OrderPaid }
  | { success: false; errorResponse: NextResponse }
