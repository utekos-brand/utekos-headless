import { acceptCanonicalViewPromotion } from './acceptCanonicalViewPromotion'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalViewPromotionRequest =
  createBrowserEventRequestHandler(acceptCanonicalViewPromotion)
