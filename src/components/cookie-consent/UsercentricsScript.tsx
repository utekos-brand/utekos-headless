import {
  USERCENTRICS_CONSENT_EVENT_NAME,
  USERCENTRICS_SETTINGS_ID,
  USERCENTRICS_SGTM_ORIGIN
} from './usercentricsConfig'
import { UsercentricsAutoblockerScript } from './UsercentricsAutoblockerScript'

// Custom CMP styling: Usercentrics Admin → Appearance → Styling → Custom CSS.
// Source: src/components/cookie-consent/usercentrics.custom.css
// Print for paste: npm run usercentrics:css

export const GOOGLE_CONSENT_DEFAULT_SCRIPT = `
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
  window.addEventListener('${USERCENTRICS_CONSENT_EVENT_NAME}', function(event) {
    if (!event.detail || event.detail.event !== 'consent_status') {
      return;
    }

    window.setTimeout(function() {
      var hasApplicationOverlay = document.querySelector('[data-slot="dialog-content"], [data-slot="drawer-content"], [data-slot="sheet-content"]');

      if (hasApplicationOverlay) {
        return;
      }

      if (document.body && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }

      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflow = '';
      }
    }, 250);
  });
`

export function GoogleConsentDefaultScript() {
  return (
    <script
      id='google-consent-default'
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: GOOGLE_CONSENT_DEFAULT_SCRIPT }}
    />
  )
}

export function UsercentricsConsentSignalsScript() {
  return (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script suppressHydrationWarning src={`${USERCENTRICS_SGTM_ORIGIN}/uc-consent-signals.js`} />
  )
}

export function UsercentricsCmpScript() {
  return (
    <script
      id='usercentrics-cmp'
      suppressHydrationWarning
      src='https://web.cmp.usercentrics.eu/ui/loader.js'
      data-settings-id={USERCENTRICS_SETTINGS_ID}
      async
    />
  )
}

export function UsercentricsScript() {
  return (
    <>
      <UsercentricsAutoblockerScript />
      <GoogleConsentDefaultScript />
      <UsercentricsConsentSignalsScript />
      <UsercentricsCmpScript />
    </>
  )
}
