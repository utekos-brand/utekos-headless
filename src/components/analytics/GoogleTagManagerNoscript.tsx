import {
  GTM_RESILIENT_NOSCRIPT_URL,
  SHOULD_LOAD_GOOGLE_TAG_MANAGER
} from '@/lib/tracking/google/googleTagManagerConfig'

export function GoogleTagManagerNoscript() {
  if (!SHOULD_LOAD_GOOGLE_TAG_MANAGER) {
    return null
  }

  return (
    <noscript>
      <iframe
        src={GTM_RESILIENT_NOSCRIPT_URL}
        height='0'
        width='0'
        style={{ display: 'none', visibility: 'hidden' }}
        title='Google Tag Manager'
      />
    </noscript>
  )
}
