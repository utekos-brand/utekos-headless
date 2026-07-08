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

  const freshState = await smokePage.evaluate(() => {
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const consentDefaults = dataLayer.filter(item => item?.[0] === 'consent');
    const loaderCount = [...document.scripts].filter(script => script.src === 'https://consent.cookiebot.com/uc.js').length;
    const gtmScriptUrls = [...document.scripts]
      .map(script => script.src)
      .filter(src => src.includes('cloud.server.utekos.no'));
    const consent = window.Cookiebot?.consent || {};

    return {
      consentDefaultCount: consentDefaults.length,
      gtmScriptUrls,
      loaderCount,
      consent,
      unexpectedlyGranted: ['preferences', 'statistics', 'marketing'].filter(category => consent[category] === true)
    };
  });

  const preConsentForbiddenRequests = requests.filter(url => {
    if (!optionalRequestPatterns.some(pattern => url.includes(pattern))) {
      return false
    }

    // Microsoft UET advanced consent may emit consent/default pings before explicit accept.
    if (url.includes('bat.bing.net') && (url.includes('evt=consent') || url.includes('asc=D'))) {
      return false
    }

    // Clarity may emit cookieless collect pings while analytics consent is denied.
    if (url.includes('clarity.ms/collect')) {
      return false
    }

    return true
  });

  const requestCountBeforeAccept = requests.length;
  const responseCountBeforeAccept = responses.length;
  await smokePage.evaluate(() => {
    window.Cookiebot?.submitCustomConsent?.(true, true, true);
  });
  await smokePage.waitForTimeout(3500);

  const acceptedState = await smokePage.evaluate(() => {
    const consent = window.Cookiebot?.consent || {};
    const gtmScriptUrls = [...document.scripts]
      .map(script => script.src)
      .filter(src => src.includes('cloud.server.utekos.no'));

    return {
      notGranted: ['preferences', 'statistics', 'marketing'].filter(category => consent[category] !== true),
      gtmScriptUrls
    };
  });
  const acceptedRequests = requests.slice(requestCountBeforeAccept);
  const acceptedResponses = responses.slice(responseCountBeforeAccept);
  const googleTagStatuses = acceptedResponses
    .filter(response => response.url.includes('/gtag/js?id=' + canonicalGoogleTagId))
    .map(response => response.status);

  await smokePage.evaluate(() => {
    window.Cookiebot?.submitCustomConsent?.(false, false, false);
  });
  await smokePage.waitForTimeout(1500);

  const withdrawnState = await smokePage.evaluate(() => {
    const consent = window.Cookiebot?.consent || {};
    return {
      stillGranted: ['preferences', 'statistics', 'marketing'].filter(category => consent[category] === true)
    };
  });

  const failures = [];

  if (freshState.loaderCount !== 1) failures.push('Expected exactly one Cookiebot loader.');
  if (freshState.consentDefaultCount < 1) failures.push('Expected initial default-denied consent command.');
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
