import Script from 'next/script'
import {
  COOKIEBOT_BLOCKING_MODE,
  COOKIEBOT_DOMAIN_GROUP_ID,
  COOKIEBOT_SCRIPT_URL
} from '@/components/cookie-consent/cookiebotConfig'

export const GOOGLE_AND_MICROSOFT_CONSENT_DEFAULT_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
  window.gtag('consent', 'default', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 2000
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', true);
  window.uetq = window.uetq || [];
  window.uetq.push('consent', 'default', { ad_storage: 'denied' });
`

export const CookieScript = () => {
  return (
    <>
      <Script id='consent-defaults' strategy='beforeInteractive'>
        {GOOGLE_AND_MICROSOFT_CONSENT_DEFAULT_SCRIPT}
      </Script>
      <Script
        id='Cookiebot'
        src={COOKIEBOT_SCRIPT_URL}
        data-cbid={COOKIEBOT_DOMAIN_GROUP_ID}
        data-blockingmode={COOKIEBOT_BLOCKING_MODE}
        strategy='beforeInteractive'
      />
    </>
  )
}
