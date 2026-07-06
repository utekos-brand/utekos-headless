'use client'

import { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
export function ConversionTracker() {
  useEffect(() => {
    sendGTMEvent({
      event: 'conversion',
      conversion_label: 'GgpCLfd09QbEPqM_7BC',
      value: 'DATA_HER',
      transaction_id: '!7708188692',
      content_id: 'AW-17708188692'
    })
  }, []) // De tomme klammene []

  return null
}
