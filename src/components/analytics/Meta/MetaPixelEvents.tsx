// Path: src/components/analytics/MetaPixel/MetaPixelEvents.tsx
'use client'

import { PixelLogic } from '@/components/analytics/Meta/PixelLogic'
import Script from 'next/script'
import { Suspense } from 'react'

export function MetaPixelEvents() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  if (!pixelId) return null

  /* VIKTIG: Base Code inneholder INGEN fbq('track', 'PageView') eller fbq('init').
     Dette overlates 100% til PixelLogic-komponenten over.
  */
  const metaPixelBaseCode = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  `

  return (
    <>
      <Script
        id='meta-pixel-base'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{ __html: metaPixelBaseCode }}
      />
      <Suspense fallback={null}>
        <PixelLogic />
      </Suspense>
    </>
  )
}
