# Utekos server-side tagging

## Valgt arkitektur

- Usercentrics CMP v3 med settings ID `9suQr3rGddL3Tb` er eneste samtykkeplattform.
- Google Cloud Run hoster sGTM-containeren etter DNS-cutover.
- `cloud.server.utekos.no` er førsteparts-endepunktet.
- Supabase event ledger er autoritativt revisjons- og retry-lag.
- Meta Pixel og direkte Meta CAPI er de eneste Meta-kanalene.
- Meta Signals Gateway brukes ikke.

## Cloud Run-migrering (2026-06-19)

Cloud Run-tjenestene er recreatet i Google Cloud-prosjekt `project-c683eb2c-20ae-4ec2-ac3`, region
`europe-west1`:

| Tjeneste | Rolle | Status |
| --- | --- | --- |
| `gtm-preview` | GTM preview-server | Ready |
| `gtm-server` | Live tagging server | Ready |

`gtm-server` bruker Google sin offisielle `gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable` med eksisterende
GTM `CONTAINER_CONFIG`. Direkte Run-URL er verifisert:

| Endepunkt | Forventet | Status |
| --- | --- | --- |
| `https://gtm-server-rojbi5yl5q-ew.a.run.app/healthy` | `ok` | 200 |
| `https://gtm-server-rojbi5yl5q-ew.a.run.app/uc-consent-signals.js` | script | 200 |
| `https://gtm-server-rojbi5yl5q-ew.a.run.app/gtm.js?id=GTM-5TWMJQFP` | script | 200 |
| `https://gtm-server-rojbi5yl5q-ew.a.run.app/gtag/js?id=GT-MKRLF5WK` | Google tag | 200 |

`gtm-preview` kjører med `RUN_AS_PREVIEW_SERVER=true`.
`gtm-server` peker på `PREVIEW_SERVER_URL=https://gtm-preview-rojbi5yl5q-ew.a.run.app`.

Gammel `gtm-server`, `gtm-preview` og domain mapping er slettet fra `nifty-structure-490519-u6` via Google Cloud
UI. Nåværende ADC mangler IAM til å liste gammelt prosjekt etter ryddingen.

Cloud Run domain mapping er opprettet i `project-c683eb2c-20ae-4ec2-ac3`:

| Felt | Verdi |
| --- | --- |
| Domain | `cloud.server.utekos.no` |
| Route | `gtm-server` |
| `DomainRoutable` | `True` |
| `Ready` | `True` |
| `CertificateProvisioned` | `True` |

DNS hos One.com er endret og bekreftet hos `ns01.one.com`, `ns02.one.com`, Google DNS, Google DoH,
Cloudflare DNS og Quad9:

```text
cloud.server CNAME ghs.googlehosted.com.
```

Domain verification ble gjennomført ved å midlertidig fjerne `cloud.server` CNAME, legge Google TXT-tokenen for
`cloud.server.utekos.no`, verifisere subdomenet, og deretter legge CNAME tilbake til `ghs.googlehosted.com`.

Produksjonsdomenet peker nå til ny Cloud Run domain mapping og er verifisert grønt:

| Endepunkt | Observert status 2026-06-19 |
| --- | --- |
| `https://cloud.server.utekos.no/healthy` | `ok`, HTTP 200 |
| `https://cloud.server.utekos.no/uc-consent-signals.js` | HTTP 200 |
| `https://cloud.server.utekos.no/gtm.js?id=GTM-5TWMJQFP` | HTTP 200 |
| `https://cloud.server.utekos.no/ns.html?id=GTM-5TWMJQFP` | HTTP 200 |
| `https://cloud.server.utekos.no/gtag/js?id=GT-MKRLF5WK` | HTTP 200 |

Etter DNS-cutover er Google sitt helsesjekkendepunkt `/healthy`, ikke Usercentrics sitt tidligere `/healthz`.

## Verifiserte endepunkter for produksjonsdomene (før DNS-cutover, 2026-06-15)

| Endepunkt                                                                   | Forventet     | Status |
| --------------------------------------------------------------------------- | ------------- | ------ |
| `https://cloud.server.utekos.no/healthz`                                    | `ok`          | 200    |
| `https://cloud.server.utekos.no/uc-consent-signals.js`                      | script        | 200    |
| `https://cloud.server.utekos.no/gtm.js?id=GTM-5TWMJQFP`                     | script        | 200    |
| `https://cloud.server.utekos.no/ns.html?id=GTM-5TWMJQFP`                    | iframe        | 200    |
| `https://cloud.server.utekos.no/gtag/js?id=GT-MKRLF5WK`                    | Google tag    | 200    |
| `https://cloud.server.utekos.no/gtag/js?id=GT-P3JGLNDZ`                    | Google tag    | 200    |
| `https://cloud.server.utekos.no/gtag/js?id=AW-18180376403`                 | Google Ads    | 200    |
| `https://cloud.server.utekos.no/gtag/js?id=G-FCES3L0M9M`                   | measurement ID, ikke loader | 400 |
| `https://bat.bing.com/bat.js`                                              | Microsoft UET browser tag | 200 |
| `https://bat.bing.com/p/action/97247724.js`                                | Microsoft UET action loader | 200 |

`GT-MKRLF5WK` er kanonisk Google-tag. Den serverte konfigurasjonen inkluderer destination IDs
`G-FCES3L0M9M` og `AW-18180376403`. Direkte `G-FCES3L0M9M`-script er derfor ikke et
produksjonsakseptkriterium.

## Samtykkeflyt

Usercentrics auto-blocking krever at `autoblocker.js` parses før `loader.js` og før tredjepartsscripts. I
Next.js 16 kan ikke `src/proxy.ts` transformere HTML-en som senere rendres av `NextResponse.next()`, så
autoblocker prependes ikke via proxy. `next/script strategy="beforeInteractive"` ble testet lokalt, men
Usercentrics autoblocker blokkerte Next.js RSC/bootstrap inline-scripts (`Unexpected server data: missing
bootstrap script`). Derfor skal autoblocker ikke aktiveres globalt på Vercel før Next sine bootstrap-scripts
kan bypasse auto-blocking trygt, for eksempel med en dokumentert Usercentrics allowlist.

`<head>`-rekkefølge i [`UsercentricsScript.tsx`](../../components/cookie-consent/UsercentricsScript.tsx):

1. `autoblocker.js` (kun lokal/dev fallback; returnerer `null` på Vercel)
2. Google Consent Mode defaults (`denied` fail-closed)
3. `https://cloud.server.utekos.no/uc-consent-signals.js` (**før** CMP)
4. `loader.js` (`async`, `data-settings-id`)

GTM lastes ikke lenger globalt i `<head>`. [`ConsentGatedGoogleTagManager.tsx`](../../components/analytics/ConsentGatedGoogleTagManager.tsx)
monterer [`GoogleTagManagerScript.tsx`](../../components/analytics/GoogleTagManagerScript.tsx) først etter
`Google Analytics` eller `Google Ads`-samtykke og etter page-settle/idle. DataLayer og Consent Mode defaults
opprettes fortsatt tidlig, slik at events kan pushes før containeren lastes.

Nettleseren bruker `ucEvent`; serverrutene leser `ucConsentAllowedDps` fra requesten.

Google Consent Mode v2 oppdateres via
[`UsercentricsConsentProvider.tsx`](../../components/cookie-consent/UsercentricsConsentProvider.tsx) på
`ucEvent`.

Provider-dispatch opprettes bare når eventet har nødvendig DPS-samtykke:

- `Google Analytics` for dataLayer/sGTM (browser) og GA4 Measurement Protocol fallback for samtykkede
  browser business-events med `ga4Data.client_id`. `PageView` holdes på sGTM for å unngå duplisering.
- `Facebook Pixel` for Meta Pixel og direkte Meta CAPI.
- `Microsoft Advertising Remarketing` for Microsoft UET browser-events. Shopify purchase kan i tillegg
  Conversions API når UET tag ApiToken-env er satt (se
  `microsoftUetCapiTokenEnvKeys.ts`) og checkout-attribusjonen inneholder
  `msclkid`.

Shopify-webhooks lagres alltid i ledgeret, men sendes ikke til annonseplattformer uten dokumenterbart
samtykke. Microsoft CAPI bruker bare checkout-attribusjon som ble fanget ved markedsføringssamtykke.

## Vercel-miljøvariabler

```text
NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID=9suQr3rGddL3Tb
NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN=https://cloud.server.utekos.no
NEXT_PUBLIC_USERCENTRICS_CONSENT_EVENT_NAME=ucEvent
NEXT_PUBLIC_USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME=<exact DPS name from Admin>
NEXT_PUBLIC_USERCENTRICS_GOOGLE_ADS_SERVICE_NAME=Google Ads
NEXT_PUBLIC_USERCENTRICS_META_SERVICE_NAME=Facebook Pixel
NEXT_PUBLIC_USERCENTRICS_MICROSOFT_SERVICE_NAME=Microsoft Advertising Remarketing
NEXT_PUBLIC_USERCENTRICS_CLARITY_SERVICE_NAME=Microsoft Clarity
NEXT_PUBLIC_USERCENTRICS_POSTHOG_SERVICE_NAME=PostHog
NEXT_PUBLIC_USERCENTRICS_VERCEL_ANALYTICS_SERVICE_NAME=Vercel Analytics
NEXT_PUBLIC_USERCENTRICS_CHATBASE_SERVICE_NAME=Chatbase
NEXT_PUBLIC_USERCENTRICS_KLARNA_OSM_SERVICE_NAME=Klarna On-site Messaging
NEXT_PUBLIC_GOOGLE_GTM_ID=GTM-5TWMJQFP
NEXT_PUBLIC_GTM_RESILIENT_SCRIPT_URL=<optional override; only after a newly generated loader is verified>
NEXT_PUBLIC_GTM_RESILIENT_NOSCRIPT_URL=<optional; default ns.html?id=GTM-5TWMJQFP>
NEXT_PUBLIC_ENABLE_GTM_IN_DEV=1
NEXT_PUBLIC_MICROSOFT_UET_TAG_ID=97247724
NEXT_PUBLIC_ENABLE_MICROSOFT_UET_IN_DEV=1
GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm
MICROSOFT_UET_CAPI_ACCESS_TOKEN=<UetTagAuthKey from GetUetTagAuthKey; required for server-side purchase>
# Project aliases for the same Microsoft-documented UET tag token:
# MICROSOFT_UET_CAPI_TOKEN, UTEKOS_MICROSOFT_UET_CAPI_TOKEN, MICROSOFT_ADS_UET_CAPI_TOKEN
# Not valid for Conversions API auth: MICROSOFT_ADS_ACCESS_TOKEN, MICROSOFT_ADS_DEVELOPER_TOKEN
```

`NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN` forblir `https://cloud.server.utekos.no` når samme domene flyttes fra
Usercentrics til Cloud Run. Ingen app-endring er nødvendig så lenge subdomenet beholdes.

Runtime henter **UetTagAuthKey** via OAuth refresh +
[`GetUetTagAuthKey`](https://learn.microsoft.com/en-us/advertising/campaign-management-service/getuettagauthkey?view=bingads-13)
i `resolveMicrosoftUetCapiApiToken` (kort cache + retry ved 401/403).
Env-alias under er fallback/bootstrap, ikke primær runtime-kilde når OAuth finnes.

```bash
npm run microsoft-ads:fetch-uet-auth-key
```

Microsoft dokumenterer Conversions API-auth som **UET tagID + token**
(`Authorization: Bearer <ApiToken>`). `MICROSOFT_ADS_ACCESS_TOKEN` er OAuth for
Ads API og erstatter ikke UET tag ApiToken på `capi.uet.microsoft.com`.

Standard GTM-script er direkte sGTM-loader:
`https://cloud.server.utekos.no/gtm.js?id=GTM-5TWMJQFP`.

En tidligere Usercentrics Resilient Script Loader fortsatte å servere webcontainer-versjon `98` etter at
versjon `99` var publisert. `NEXT_PUBLIC_GTM_RESILIENT_SCRIPT_URL` skal derfor være unset. En resilient
override kan bare aktiveres etter at en ny URL er generert og verifisert mot gjeldende publiserte
webcontainer-versjon.

Aktiver `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` først etter vellykket GTM Web + sGTM Preview på `utekos.no`.

Lokal smoke: sett `NEXT_PUBLIC_ENABLE_GTM_IN_DEV=1` (ikke i produksjon uten behov).

## Manuell ekstern konfigurasjon (GTM + Usercentrics Admin)

### Usercentrics Admin

- [x] Publiser ruleset/settings `9suQr3rGddL3Tb`
- [x] Legg til Google Analytics, Google Ads og Facebook Pixel
- [x] Klassifiser Microsoft Clarity som `Statistikk`
- [x] Fjern `PostHog.com` og duplisert egendefinert PostHog; behold én `PostHog` som `Statistikk`
- [x] Synkroniser publiserte DPS-navn med `NEXT_PUBLIC_USERCENTRICS_*_SERVICE_NAME`
- [x] Verifiser publisert tjenestekart og bannerkonfigurasjon
- [x] Deaktiver gammel Resilient Script Loader som serverte webcontainer-versjon `98`

### GTM Server container

- [x] Behold Usercentrics consent-signals-client
- [x] Fjern duplisert GA4-client og feilkonfigurert server-tag
- [x] Aktiver gtag/dependency-serving i kanonisk GA4-client og map `G-FCES3L0M9M`
- [x] Publiser server-versjon `17`
- [x] Verifiser at `GT-MKRLF5WK`, `GT-P3JGLNDZ` og `AW-18180376403` serveres med HTTP 200
- [x] Ikke opprett native Google Ads conversion-tags: aktive primærkonverteringer er GA4-importer

### GTM Web container `GTM-5TWMJQFP`

- [x] Klargjør workspace `102`: fjern GTM-eid CMP, dupliserte Google-tags og ungated Clarity/UET
- [x] Begrens GA4-eventtaggen til eksplisitte forretningshendelser
- [x] Sett `GT-MKRLF5WK` som kanonisk Google-tag med `server_container_url=https://cloud.server.utekos.no`
- [x] Publiser web-versjon `99`
- [x] Verifiser direkte sGTM-script inneholder webcontainer-versjon `99`
- [ ] **2026-07-07:** Workspace `106` oppdaterer trigger `122` (`Canonical GA4 business events`) til
  `^(page_view|view_item_list|select_item|view_item|add_to_cart|begin_checkout|purchase|search|generate_lead)$`.
  Live publisert versjon er fortsatt `102` med gammel regex uten `select_item`/`view_item_list` til OAuth
  reauth gir `tagmanager.edit.containerversions` + `tagmanager.publish`. Kjør
  `npm run tracking:gtm-publish-commerce` etter `gtm-mcp-auth`.

GTM API-pekere for web-container `GTM-5TWMJQFP`:

| Felt | Verdi |
| --- | --- |
| Account ID | `6295468138` (`Utekos Marketing Group \| Tracking`) |
| Container ID | `220236256` |
| Workspace ID | `106` (`Default Workspace`) |
| Trigger ID | `122` (`Canonical GA4 business events`) |
| GA4 event tag ID | `118` (`Google Analytics GA4-hendelse`, `__gaawe`) |
| Canonical Google tag ID | `109` (`GT-MKRLF5WK`) |

Servicekontonøkkelen er rotert og GA4 property `489598217`, Realtime API, Data API og Admin API er verifisert
med HTTP 200. GTM OAuth-tokenet har nødvendige scopes for Quick Preview, container-versjoner og publisering.
Rollback-versjoner er web `98` og server `15`.

## Produksjonskontroll

- Verifiser på **https://utekos.no** (ikke googletagmanager.com): Tag Assistant Connected + GTM Preview
- Standardstatus, godta, avslå og tilbaketrekking i Tag Assistant
- `ucEvent`, `ucConsentAllowedDps` og sGTM Preview
- Microsoft UET browser: `add_to_cart` og `purchase` skal gi 204-respons mot `ti=97247724` med `event_id`,
  `gv`, `gc`, `prodid`, `pagetype` og `msclkid` når Microsoft-samtykke foreligger.
- Microsoft UET CAPI: `sendMicrosoftUetPurchase` skal ikke returnere
  `missing_capi_token` når minst ett UET CAPI-env er satt i Vercel
  Production (`MICROSOFT_UET_CAPI_ACCESS_TOKEN` eller aliasene i
  [DEPLOYMENT.md](../../../DEPLOYMENT.md)). `MICROSOFT_ADS_ACCESS_TOKEN`
  alene er ikke tilstrekkelig.
- Meta Pixel og direkte CAPI deler `event_id`
- Meta sendes aldri via sGTM
- Browser-`PageView` dupliseres ikke via Measurement Protocol når `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm`.
  Browser business-events som `select_item`, `add_to_cart`, `begin_checkout`, `view_item`,
  `view_item_list`, `search` og `generate_lead` kan køes til GA4 Measurement Protocol når sGTM-eventtaggen
  ikke kan bevises å sende dem.
- Ukjente tjenester i DPS-skanningen er klassifisert
