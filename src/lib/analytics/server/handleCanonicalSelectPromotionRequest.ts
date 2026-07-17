import { acceptCanonicalSelectPromotion } from './acceptCanonicalSelectPromotion'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalSelectPromotionRequest =
  createBrowserEventRequestHandler(acceptCanonicalSelectPromotion)
