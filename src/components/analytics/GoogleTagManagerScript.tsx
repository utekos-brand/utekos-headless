'use client'

import Script from 'next/script'
import {
  GOOGLE_TAG_MANAGER_ID,
  GTM_RESILIENT_SCRIPT_URL,
  GTM_SGTM_SCRIPT_URL,
  SHOULD_LOAD_GOOGLE_TAG_MANAGER
} from '@/lib/tracking/google/googleTagManagerConfig'

function createGoogleTagManagerBootstrapScript(scriptUrl: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    (function(w,d,s,l,u){
      var first=d.getElementsByTagName(s)[0];
      var script=d.createElement(s);
      var dl=l!='dataLayer'?'&l='+l:'';
      script.async=true;
      script.src=u+dl;
      first.parentNode.insertBefore(script,first);
    })(window,document,'script','dataLayer',${JSON.stringify(scriptUrl)});
  `
}

export function GoogleTagManagerScript() {
  if (!SHOULD_LOAD_GOOGLE_TAG_MANAGER) {
    return null
  }

  const scriptUrl = GTM_RESILIENT_SCRIPT_URL || GTM_SGTM_SCRIPT_URL
  return (
    <Script
      id={`gtm-bootstrap-${GOOGLE_TAG_MANAGER_ID}`}
      strategy='afterInteractive'
    >
      {createGoogleTagManagerBootstrapScript(scriptUrl)}
    </Script>
  )
}
