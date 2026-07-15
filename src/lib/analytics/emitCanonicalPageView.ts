import { sendGTMEvent } from '@next/third-parties/google'
import {
  buildPageViewDataLayerEvent,
  type CanonicalPageView
} from './pageViewEvent'

export function emitCanonicalPageView(event: CanonicalPageView): void {
  sendGTMEvent(buildPageViewDataLayerEvent(event))
}
