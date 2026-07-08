#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${TRACKING_SMOKE_BASE_URL:-https://utekos.no}"
CANONICAL_GOOGLE_TAG_ID="${CANONICAL_GOOGLE_TAG_ID:-GT-MKRLF5WK}"
SESSION="utekos-tracking-smoke-$$"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"
BASE_URL_JSON="$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$BASE_URL")"
CANONICAL_GOOGLE_TAG_ID_JSON="$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$CANONICAL_GOOGLE_TAG_ID")"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run the tracking smoke test." >&2
  exit 1
fi

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright CLI wrapper not found at $PWCLI." >&2
  exit 1
fi

cleanup() {
  "$PWCLI" -s="$SESSION" close >/dev/null 2>&1 || true
}

trap cleanup EXIT

"$PWCLI" -s="$SESSION" open "$BASE_URL" >/dev/null

SMOKE_OUTPUT="$("$PWCLI" -s="$SESSION" run-code "async (page) => {
  const baseUrl = $BASE_URL_JSON;
  const canonicalGoogleTagId = $CANONICAL_GOOGLE_TAG_ID_JSON;
  const browser = page.context().browser();

  if (!browser) {
    throw new Error('Playwright browser instance is unavailable.');
  }

  const smokeContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    geolocation: { latitude: 59.9139, longitude: 10.7522 },
    permissions: ['geolocation']
  });
  const smokePage = await smokeContext.newPage();
  const requiredServices = [
    'Google Analytics',
    'Google Ads',
    'Facebook Pixel',
    'Microsoft Advertising Remarketing',
    'Microsoft Clarity',
    'PostHog'
  ];
  const optionalRequestPatterns = [
    'connect.facebook.net',
    'facebook.com/tr',
    'f.clarity.ms',
    'bat.bing.net',
    'portal.utekos.no'
  ];
  const requests = [];
  const responses = [];

  smokePage.on('request', request => requests.push(request.url()));
  smokePage.on('response', response => responses.push({ url: response.url(), status: response.status() }));

  await smokePage.goto(baseUrl);
  await smokePage.waitForTimeout(3500);

  const freshState = await smokePage.evaluate(required => {
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const consentEvents = dataLayer.filter(item => item && typeof item === 'object' && item.event === 'consent_status');
    const latestConsent = consentEvents.at(-1) || {};
    const loaderCount = [...document.scripts].filter(script => script.src === 'https://web.cmp.usercentrics.eu/ui/loader.js').length;
    const gtmScriptUrls = [...document.scripts]
      .map(script => script.src)
      .filter(src => src.includes('cloud.server.utekos.no'));

    return {
      consentEventCount: consentEvents.length,
      consentType: latestConsent.type,
      gtmScriptUrls,
      loaderCount,
      missingServices: required.filter(service => typeof latestConsent[service] !== 'boolean'),
      serviceStates: Object.fromEntries(required.map(service => [service, latestConsent[service]])),
      unexpectedlyGranted: required.filter(service => latestConsent[service] === true)
    };
  }, requiredServices);

  const preConsentForbiddenRequests = requests.filter(url =>
    optionalRequestPatterns.some(pattern => url.includes(pattern))
  );

  const requestCountBeforeAccept = requests.length;
  const responseCountBeforeAccept = responses.length;
  await smokePage.evaluate(async () => {
    await window.__ucCmp?.acceptAllConsents();
  });
  await smokePage.waitForTimeout(3500);

  const acceptedState = await smokePage.evaluate(required => {
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const consentEvents = dataLayer.filter(item => item && typeof item === 'object' && item.event === 'consent_status');
    const latestConsent = consentEvents.at(-1) || {};
    const gtmScriptUrls = [...document.scripts]
      .map(script => script.src)
      .filter(src => src.includes('cloud.server.utekos.no'));

    return {
      notGranted: required.filter(service => latestConsent[service] !== true),
      gtmScriptUrls
    };
  }, requiredServices);
  const acceptedRequests = requests.slice(requestCountBeforeAccept);
  const acceptedResponses = responses.slice(responseCountBeforeAccept);
  const googleTagStatuses = acceptedResponses
    .filter(response => response.url.includes('/gtag/js?id=' + canonicalGoogleTagId))
    .map(response => response.status);

  await smokePage.evaluate(async () => {
    await window.__ucCmp?.denyAllConsents();
  });
  await smokePage.waitForTimeout(1500);

  const withdrawnState = await smokePage.evaluate(required => {
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const consentEvents = dataLayer.filter(item => item && typeof item === 'object' && item.event === 'consent_status');
    const latestConsent = consentEvents.at(-1) || {};

    return {
      stillGranted: required.filter(service => latestConsent[service] === true)
    };
  }, requiredServices);

  const failures = [];

  if (freshState.loaderCount !== 1) failures.push('Expected exactly one Usercentrics loader.');
  if (freshState.consentEventCount !== 1) failures.push('Expected exactly one initial consent_status event.');
  if (freshState.consentType !== 'IMPLICIT') failures.push('Fresh browser did not receive implicit initial consent.');
  if (freshState.gtmScriptUrls.some(url => url.includes('/u2/'))) failures.push('Stale Usercentrics resilient GTM loader is active.');
  if (freshState.gtmScriptUrls.some(url => url.includes('/gtm.js?id=GTM-5TWMJQFP'))) {
    failures.push('sGTM web-container loader loaded before consent.');
  }
  if (freshState.missingServices.length > 0) failures.push('Required Usercentrics services are missing.');
  if (freshState.unexpectedlyGranted.length > 0) failures.push('Optional tracking services were implicitly granted.');
  if (preConsentForbiddenRequests.length > 0) failures.push('Optional vendor requests occurred before consent.');
  if (!acceptedState.gtmScriptUrls.some(url => url.includes('/gtm.js?id=GTM-5TWMJQFP'))) {
    failures.push('Direct sGTM web-container loader is missing after consent.');
  }
  if (!googleTagStatuses.includes(200)) failures.push('sGTM did not serve the canonical Google tag destination after consent.');
  if (acceptedState.notGranted.length > 0) failures.push('Accept all did not grant every required tracking service.');
  if (acceptedRequests.some(url => url.includes('www.google-analytics.com/g/collect'))) {
    failures.push('GA4 fell back to the direct Google Analytics collect endpoint after consent.');
  }
  if (withdrawnState.stillGranted.length > 0) failures.push('Consent withdrawal left optional tracking services granted.');

  const result = {
    baseUrl,
    freshState,
    preConsentForbiddenRequests,
    canonicalGoogleTagId,
    googleTagStatuses,
    acceptedGtmScriptUrls: acceptedState.gtmScriptUrls,
    acceptedState,
    withdrawnState,
    failures
  };

  await smokeContext.close();

  if (failures.length > 0) {
    throw new Error(JSON.stringify(result, null, 2));
  }

  return result;
}")"

printf '%s\n' "$SMOKE_OUTPUT"

if [[ "$SMOKE_OUTPUT" == *"### Error"* ]]; then
  exit 1
fi
