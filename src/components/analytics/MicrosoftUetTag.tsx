'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { USERCENTRICS_MICROSOFT_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'

const DEFAULT_MICROSOFT_UET_TAG_ID = '97247724'

export const MICROSOFT_UET_TAG_ID =
  process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID || DEFAULT_MICROSOFT_UET_TAG_ID

export const SHOULD_LOAD_MICROSOFT_UET =
  !!MICROSOFT_UET_TAG_ID
  && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MICROSOFT_UET_IN_DEV === '1')
  && process.env.VERCEL_ENV !== 'preview'

type MicrosoftUetTagProps = {
  tagId?: string
}

const MICROSOFT_UET_ENHANCED_CONVERSIONS_SCRIPT = `
  (function() {
    function readCookie(name) {
      var prefix = name + '=';
      var parts = document.cookie ? document.cookie.split('; ') : [];
      for (var index = 0; index < parts.length; index += 1) {
        var part = parts[index];
        if (part.indexOf(prefix) === 0) {
          return decodeURIComponent(part.slice(prefix.length));
        }
      }
      return '';
    }

    function setMicrosoftUetPid() {
      var email = readCookie('ute_user_hash') || readCookie('email_hash');
      var phone = readCookie('ute_phone_hash');
      if (!email && !phone) return;

      window.uetq = window.uetq || [];
      window.uetq.push('set', {
        pid: {
          em: email || '',
          ph: phone || ''
        }
      });
    }

    window.uet_report_conversion = function(productId, revenueValue, currency, eventId) {
      window.uetq = window.uetq || [];
      setMicrosoftUetPid();
      var payload = {
        ecomm_prodid: productId,
        ecomm_pagetype: 'purchase',
        revenue_value: Number(revenueValue) || 0,
        currency: currency || 'NOK'
      };
      if (eventId) {
        payload.event_id = eventId;
      }
      window.uetq.push('event', 'purchase', payload);
    };

    setMicrosoftUetPid();
  })();
`

function createMicrosoftUetBootstrapScript(tagId: string): string {
  return `
    (function(w,d,t,u,o) {
      w[u] = w[u] || [];
      w[u].push('consent', 'default', { ad_storage: 'granted' });
      o = {
        ti: ${JSON.stringify(tagId)},
        enableAutoSpaTracking: true,
        enableAutoConsent: false
      };
      o.ts = (new Date()).getTime();
      var script = d.createElement(t);
      script.src = 'https://bat.bing.com/bat.js';
      script.async = 1;
      script.onload = script.onreadystatechange = function() {
        var state = this.readyState;
        if (!state || state === 'loaded' || state === 'complete') {
          o.q = w[u];
          w[u] = new UET(o);
          w[u].push('pageLoad');
          script.onload = script.onreadystatechange = null;
        }
      };
      var firstScript = d.getElementsByTagName(t)[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    })(window, document, 'script', 'uetq');
  `
}

export function MicrosoftUetTag({ tagId = MICROSOFT_UET_TAG_ID }: MicrosoftUetTagProps) {
  const hasMarketingConsent = useConsentForService(USERCENTRICS_MICROSOFT_SERVICE_NAME)

  useEffect(() => {
    window.uetq = window.uetq || []
    window.uetq.push('consent', 'update', {
      ad_storage: hasMarketingConsent ? 'granted' : 'denied'
    })
  }, [hasMarketingConsent])

  if (!SHOULD_LOAD_MICROSOFT_UET || !tagId || !hasMarketingConsent) return null

  return (
    <>
      <Script id='microsoft-uet-bootstrap' strategy='afterInteractive'>
        {createMicrosoftUetBootstrapScript(tagId)}
      </Script>
      <Script id='microsoft-uet-enhanced-conversions' strategy='afterInteractive'>
        {MICROSOFT_UET_ENHANCED_CONVERSIONS_SCRIPT}
      </Script>
    </>
  )
}
