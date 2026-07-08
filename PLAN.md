# PROJECT PLAN

## Status

STATUS: SGTM ER FLYTTET TIL NYTT GOOGLE CLOUD-PROSJEKT;
PRODUKSJONSDOMENET ER VERIFISERT GRØNT; TELEMETRY- OG
PLATTFORMHERDING ER IMPLEMENTERT LOKALT I READ-ONLY/FAIL-CLOSED
MODUS; SUPABASE PRODUCTION-MUTASJON FOR TELEMETRY-HERDING ER
UTFØRT OG VERIFISERT; VERCEL PRODUCTION DEPLOY ER GODKJENT FOR
DENNE RELEASEN; PROVIDER WRITES OG GTM PUBLISH ER FORTSATT
BLOKKERT UTEN SEPARAT EKSPLISITT GODKJENNING

## Telemetry- og plattformherding

Dato: 2026-07-07

Deploy-/migrasjonsrekkefølge er nå kanonisk dokumentert i
[DEPLOYMENT.md](DEPLOYMENT.md). Den skal leses før alle production
deploys, Supabase-mutasjoner, env-endringer, GTM-publiseringer,
trackingendringer og providerendringer.

### Cookiebot CMP-migrering

Dato: 2026-07-08

Usercentrics CMP v3-runtime er fjernet fra applikasjonen. Cookiebot
CMP (Usercentrics-produkt) er nå autoritativ samtykkekilde.

- Domain group ID: `f2145160-1ac5-4859-8385-36dc6327495f`
- Loader: `https://consent.cookiebot.com/uc.js` med
  `data-blockingmode="auto"`
- Server consent cookie: `CookieConsent` (ikke `ucConsentAllowedDps`)
- Window-events: `CookiebotOnConsentReady`, `CookiebotOnAccept`,
  `CookiebotOnDecline`
- GTM lastes uten React-consent-gate; Consent Initialisation i GTM
  + default-denied i `CookieScript.tsx`
- Microsoft UET bootstrap lastes alltid (advanced consent); events
  er fortsatt marketing-gated
- Tjenestenavn styres i
  `src/components/cookie-consent/cookiebotConfig.ts`

**Verifisert lokalt:**

- `npx tsx --test src/components/cookie-consent/cookiebotConsent.test.ts`: grønn
- `pnpm exec tsc --noEmit`: grønn
- `npm run tracking:smoke` mot `localhost:3000`: grønn (2026-07-08)
- `npm run mcp:commerce-tracking:doctor`: grønn (Meta, Microsoft, sGTM live)
- Supabase `marketing.event_ledger`: aktiv (228 PageView siste 7 dager)
- Supabase provider dispatch: `meta` 876 succeeded, `google` 655 succeeded
- Browser-smoke på `localhost:3000` (Cookiebot loader, consent defaults,
  ingen Usercentrics-scripts)

**Gjenstår før produksjonssign-off:**

- Vercel deploy med Cookiebot-endringer
- `npm run tracking:smoke` og `npm run tracking:commerce-smoke` mot
  preview/prod
- GTM Preview: Cookiebot CMP-tag + Consent Initialisation
- Cookiebot Admin: scanner må matche tjenestenavn i `cookiebotConfig.ts`
- Sett `NEXT_PUBLIC_TRACKING_SGTM_ORIGIN` i Vercel (erstatter
  `NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN` om den finnes)

### Nåværende operativ beslutning

- Supabase er kanonisk tracking-, audit- og provider-statuslager.
  PostHog beholdes som seriøs produktanalyse, ikke som
  finansielt/provider-kanonisk lager.
- Meta, Google og Microsoft behandles som aktive annonseplattformer
  med lik kravstandard for auth, read-only diagnostikk, smoke,
  providerstatus og dokumentasjon.
- Første gjennomføring er read-only/fail-closed for providerne.
  Supabase production mutation er utført for databaseforutsetningene
  runtime nå krever. Vercel production deploy er eksplisitt godkjent
  for denne releasen. Provider writes og GTM publish er ikke utført.
- Microsoft/Bing er utvidet fra UET endpoint-check til full
  Microsoft Advertising-flate: OAuth/MFA, Ads API, Ad Insight,
  Shopping Content/Merchant Center, UET CAPI, Scripts som separat
  automatiseringsflate og Clarity Advertising/Consent API V2.
- Google Ads native conversion tag holdes fortsatt ute inntil
  dobbelttelling mot GA4-importerte konverteringer er avklart.

### Implementert lokalt

- `.env.mcp.example` er renset lokalt for token-lignende verdier og
  bruker placeholders. Eksponerte ekte tokens må fortsatt roteres hos
  provider dersom de har vært reelle.
- `config/mcp/servers.base.json` inneholder nå `google-ads-mcp` med
  env-placeholders og `meta-ads-read-only` som egen read-only
  diagnoseflate. Generated `mcp.json` og `.vscode/mcp.json` skal
  fortsatt kun bygges via `npm run mcp:build`.
- Commerce/Tracking MCP er utvidet til 28 kanoniske read-only tools.
  Nye Microsoft-prober dekker auth readiness, account access,
  campaign status, Ad Insight, Shopping Content og Clarity Ads
  readiness. `provider_env_readiness` skiller nå blant annet
  `microsoft_uet`, `microsoft_ads`, `microsoft_clarity`, `google_ads`,
  `meta` og `posthog`.
- Microsoft Advertising auth forventer `msads.manage`,
  developer token, CustomerId, AccountId, access token og
  refresh-token-håndtering. Shopping Content-proben bruker samme
  tokenoppløser.
- Meta Ads er delt i read-only diagnose og write-flater. Default MCP
  for Meta-diagnose skal ikke kunne endre kampanjer, budsjetter,
  målgrupper, kreativer eller datasett.
- Supabase-skjemaet er herdet lokalt og i production med migrasjonen
  `20260707111433_harden_provider_dispatch_audit_statuses.sql`.
  Den sikrer `marketing.campaign_insights`,
  `ops.integration_job_leases`, nye provider-auditfelter,
  statusen `skipped_unqualified`, dispatch modes, dead-letter
  resolution-felter og viewene `ops.provider_dispatch_health` og
  `ops.dead_letter_summary`.
- Provider-audit støtter nå `meta`, `google` og `microsoft_uet`.
  `missing_client_id` for Google klassifiseres som
  `skipped_unqualified`, ikke aktiv dead-letter feil.
- Shopify `orders-paid` skriver provider-audit for Google og
  Microsoft UET purchase som `server_direct`. Generisk retry-claiming
  er fortsatt avgrenset til `meta` og `google` med
  `dispatch_mode='server_retry'`.
- PostHog er endret til eksplisitt, samtykkegatet produktanalyse:
  `autocapture: false`, manuell `$pageview`, trygg commerce-helper,
  `NEXT_PUBLIC_POSTHOG_KEY` med legacy fallback, og session replay
  kun når aktivert med streng input-, tekst- og nettverksmaskering.
- Browser commerce smoke er utvidet til å kreve Google dataLayer,
  Meta Pixel-network, Microsoft UET browser network/queue, Clarity
  Consent API V2, PostHog init/capture evidence, Supabase rows og
  Microsoft UET CAPI purchase-status via
  `TRACKING_COMMERCE_SMOKE_PURCHASE_EVENT_ID`.
- Lokale runbooks for Meta Dataset Quality og Microsoft Advertising
  finnes i dette arbeidsområdet under `docs/meta/` og
  `docs/microsoft/`. Merk at `docs/` er ignorert i nåværende
  repo-policy; de må unignores eller flyttes dersom de skal bli
  tracked teamdokumentasjon.

### Verifisert etter herding

- `npm run mcp:build`: grønn, med forventede advarsler for tomme
  valgfrie Google Ads OAuth/customer-envs.
- `npm run mcp:doctor`: grønn, med samme seks valgfrie Google Ads
  env-advarsler.
- `npm run mcp:commerce-tracking:doctor`: grønn. Doctor bekrefter
  28 tools, 13 providers, fire live-verifiserte flater og
  strukturerte fail-closed credential/scope-resultater for manglende
  provider-tilganger.
- `node --check` for commerce smoke og Commerce/Tracking MCP doctor:
  grønn.
- Targeted unit tests for order tracking og PostHog commerce helper:
  fire av fire tester grønn.
- `pnpm exec tsc --noEmit`: grønn.
- `npm run build`: grønn med kun font fallback warnings for
  `Google Sans Flex` og `Google Sans`.
- Supabase migration history matcher nå lokale migrasjoner etter
  kontrollert repair: `20260609204152` ble markert reverted fordi den
  var samme `add_website_visitor_events` som lokal `20260609192500`.
  `20260609090000`, `20260609192500` og `20260613120000` ble markert
  applied fordi production schema allerede beviste objektene.
- `SUPABASE_NO_TELEMETRY=1 npx supabase db push --linked
  --include-all`: kjørte production-migrasjonene
  `20260612120000_add_integration_job_leases.sql` og
  `20260707111433_harden_provider_dispatch_audit_statuses.sql`.
- Supabase production query bekrefter at
  `ops.integration_job_leases`, `marketing.campaign_insights`,
  `ops.provider_dispatch_health`, `ops.dead_letter_summary`,
  `dispatch_mode`, `skip_reason` og dead-letter resolution-felter
  finnes.
- Constraint-query bekrefter at `provider_dispatch_attempts` tillater
  `skipped_unqualified` og har `dispatch_mode`-sjekk for
  `server_retry`, `server_direct` og `client_observed`.
- `npx supabase db lint --linked --schema marketing,ops,analytics`:
  grønn, "No schema errors found".
- Secret scan av `.env.mcp.example`, `.mcp.json`,
  `config/mcp/credentials.manifest.json`,
  `config/mcp/servers.base.json`, `mcp.json` og `.vscode/mcp.json`
  fant ikke de eksponerte token-/konto-strengene.

### Ikke utført med vilje

- Browser commerce smoke er ikke kjørt fordi den sender live
  tracking-events og nå krever en konkret
  `TRACKING_COMMERCE_SMOKE_PURCHASE_EVENT_ID` for Microsoft UET CAPI
  purchase-status.
- Tokenrotasjon hos Google/Meta/Microsoft er ikke utført fra repoet.
  Lokale eksponerte verdier er fjernet; providerrotasjon må gjøres
  separat dersom verdiene var ekte.
- `npm run lint` er fortsatt ikke en ren completion gate. Den feiler
  på bred, eksisterende repo-gjeld utenfor denne herdingpakken.

### Neste gates

- Følg [DEPLOYMENT.md](DEPLOYMENT.md) for release order ved videre
  arbeid: Supabase først når runtime krever nye databaseobjekter,
  deretter Vercel production deploy, deretter
  provider-/tracking-smoke.
- Denne tråden har eksplisitt godkjent og gjennomført Supabase
  production-mutasjon for telemetry-herdingen. Vercel production
  deploy er også eksplisitt godkjent for denne releasen.
- Fyll Microsoft Advertising/Shopping/Clarity credentials i lokal
  secret store, kjør Microsoft read-only probes, og marker
  Microsoft OK først når OAuth, account access, campaign status, UET,
  Shopping Content og Clarity readiness er bevist.
- Fyll Google Ads OAuth/customer-envs og kjør Google Ads read-only
  probes før Google Ads MCP regnes som live-operativt.
- Kjør commerce browser smoke med eksplisitt purchase event id når
  live tracking-testen er godkjent.
- Flytt eller unignore de nye Meta/Microsoft runbookene dersom de
  skal være en del av tracked repo-dokumentasjon.


## Cloud Run sGTM-hosting

Dato: 2026-06-19

- sGTM er recreatet i Google Cloud-prosjekt
  `project-c683eb2c-20ae-4ec2-ac3`, region `europe-west1`, fordi
  tidligere prosjekt `nifty-structure-490519-u6` returnerte
  Google Frontend 500/503 når billing ble deaktivert.
- Billing er aktivert i nytt prosjekt:
  `billingAccounts/012640-E91F1E-A107B9`, `billingEnabled=true`.
- Nye Cloud Run-tjenester:
  - `gtm-preview`: `https://gtm-preview-rojbi5yl5q-ew.a.run.app`
  - `gtm-server`: `https://gtm-server-rojbi5yl5q-ew.a.run.app`
- Begge tjenestene kjører Google sin offisielle
  `gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable` med
  eksisterende GTM `CONTAINER_CONFIG`.
- `gtm-preview` er satt opp med `RUN_AS_PREVIEW_SERVER=true`.
- `gtm-server` er satt opp med
  `PREVIEW_SERVER_URL=https://gtm-preview-rojbi5yl5q-ew.a.run.app`.
- Direkte ny Run-URL er verifisert:
  - `https://gtm-server-rojbi5yl5q-ew.a.run.app/healthy` -> `ok`,
    HTTP 200
  - `https://gtm-server-rojbi5yl5q-ew.a.run.app/uc-consent-signals.js`
    -> HTTP 200
  - `https://gtm-server-rojbi5yl5q-ew.a.run.app/gtm.js?id=GTM-5TWMJQFP`
    -> HTTP 200
  - `https://gtm-server-rojbi5yl5q-ew.a.run.app/gtag/js?id=GT-MKRLF5WK`
    -> HTTP 200
- Gammel `gtm-server`, `gtm-preview` og domain mapping er slettet
  fra `nifty-structure-490519-u6` via Google Cloud UI. Nåværende
  ADC mangler IAM til å liste gammelt prosjekt etter ryddingen.
- `cloud.server.utekos.no` har riktig DNS for Cloud Run domain
  mapping: `cloud.server.utekos.no` -> `ghs.googlehosted.com.`
- Domain verification ble gjennomført ved å midlertidig fjerne
  `cloud.server` CNAME, legge Google TXT-tokenen for
  `cloud.server.utekos.no`, verifisere subdomenet, og deretter
  legge CNAME tilbake.
- Ny Cloud Run domain mapping er opprettet i
  `project-c683eb2c-20ae-4ec2-ac3`:
  - domain: `cloud.server.utekos.no`
  - route: `gtm-server`
  - `DomainRoutable=True`
  - `Ready=True`
  - `CertificateProvisioned=True`
- One.com autoritative navneservere (`ns01.one.com`,
  `ns02.one.com`) og Google/Cloudflare DNS returnerer
  `cloud.server.utekos.no CNAME ghs.googlehosted.com.`
- Produksjonsdomenet er verifisert 2026-06-19 22:00 UTC:
  - `https://cloud.server.utekos.no/healthy` -> `ok`, HTTP 200
  - `https://cloud.server.utekos.no/uc-consent-signals.js` ->
    HTTP 200
  - `https://cloud.server.utekos.no/gtm.js?id=GTM-5TWMJQFP` ->
    HTTP 200
  - `https://cloud.server.utekos.no/ns.html?id=GTM-5TWMJQFP` ->
    HTTP 200
  - `https://cloud.server.utekos.no/gtag/js?id=GT-MKRLF5WK` ->
    HTTP 200
- Nåværende Cloud Run-skalering er kostnadsbevisst og ikke full
  HA: `gtm-server` har `maxScale=5` og ingen verifisert
  `minScale`. Google anbefaler minimum 2 instanser for lavere
  risiko for datatap ved live trafikk, men dette øker fast
  månedskost.

## Lokal Docker- og utviklingsmiljø

Dato: 2026-06-15

- Node-baseline er låst til `24.14.0` via `.nvmrc`,
  `.node-version` og Docker ARG default.
- Docker dev bruker Next.js dev-server på `0.0.0.0:3000`, bind
  mount av repoet, navngitte volum for `node_modules`, `.next` og
  npm-cache, og polling-basert file watching i container.
- `scripts/docker/dev-entrypoint.sh` kjører `npm ci` bare når
  `package.json` eller `package-lock.json` endres.
- Produksjonscontainer-smoke bruker Next.js standalone-output kun
  når `NEXT_OUTPUT_STANDALONE=1` settes i Docker build.
  `.env.local` gis inn som BuildKit-secret og kopieres ikke inn i
  imaget.
- Supabase lokal stack forblir CLI-styrt via `npm run db:start`
  og `npm run db:reset`, slik at app-containeren ikke dupliserer
  Supabase sin Docker-orkestrering.

## Produksjonsklar dataflyt, sporing og analyse

Dato: 2026-06-09

Denne seksjonen beskriver den eldre tracking-gjenopprettingen.
Gjeldende status etter 2026-07-07-herdingen står i
`Telemetry- og plattformherding` over.

### Tracking-gjenoppretting 2026-06-11 (historisk — erstattet av Cookiebot 2026-07-08)

- Cookiebot domain group `f2145160-1ac5-4859-8385-36dc6327495f` er
  aktiv CMP. Tidligere Usercentrics ruleset `9suQr3rGddL3Tb` er
  avviklet i runtime.
- Tjenestenavn for Meta-kanalen er `Facebook Pixel`; applikasjon,
  diagnostikk, smoke-test og Vercel-miljø skal bruke dette eksakte
  navnet via `cookiebotConfig.ts`.
- GTM web-versjon `99` og server-versjon `17` er publisert.
  Rollback-versjoner er web `98` og server `15`.
- Servicekontonøkkelen er rotert. GA4 property `489598217`, Admin
  API, Data API og Realtime API returnerer HTTP 200.
- GTM OAuth-tokenet har nå nødvendige scopes for
  workspace-redigering, Quick Preview, container-versjoner og
  publisering.
- Google Ads har seks aktive conversion actions. `purchase` og
  `begin_checkout` er primære GA4-importer; native sGTM Ads
  conversion-tags er derfor ikke opprettet, fordi de ville
  duplisert de importerte konverteringene.
- `GT-MKRLF5WK` er den kanoniske Google-tag-destinasjonen. Den
  serverte taggen inkluderer både `G-FCES3L0M9M` og
  `AW-18180376403`. Direkte `/gtag/js?id=G-FCES3L0M9M` returnerer
  fortsatt 400, men er ikke den kanoniske loaderen.
- Gammel resilient GTM-loader (web-versjon `98`) er fjernet. Appen
  bruker direkte `/gtm.js?id=GTM-5TWMJQFP`; stale Vercel-override
  skal fjernes før produksjonsdeploy.

### Implementert lokalt (Cookiebot)

- Cookiebot CMP lastes i dokumenthodet med kanonisk rekkefølge:
  Consent Mode defaults (`denied`) → Cookiebot `uc.js`
  (`data-blockingmode="auto"`).
- GTM (`GTM-5TWMJQFP`) lastes etter page-settle via
  `ConsentGatedGoogleTagManager` uten React-consent-gate; Consent
  Mode og GTM Consent Initialisation styrer tag-firing.
- Cookiebot-events oppdaterer React-gates, Google Consent Mode,
  Microsoft UET consent og Clarity `consentv2` uten reload.
  Endringer lagres i `marketing.consent_snapshots`.
- `/api/tracking-events` validerer en streng, versjonert
  Zod-kontrakt og avviser valgfri lagring fail-closed når verken
  Meta-, Google- eller Microsoft-samtykke kan dokumenteres.
- Browser-events bruker én sentral dispatcher. Google pusher fortsatt
  til samtykkegatet dataLayer/sGTM, og samtykkede business-events med
  `ga4Data.client_id` køes i tillegg som GA4 Measurement Protocol
  fallback når de ikke er `PageView`. Meta Pixel og ledger/CAPI deler
  samme `event_id`. Microsoft UET er consent-gatet i samme
  dispatcher og sender dokumenterte lowercase actions
  (`add_to_cart`, `begin_checkout`, `purchase`) med `event_id`,
  `revenue_value`, `currency`, `ecomm_prodid` og lowercase
  `ecomm_pagetype`.
- Shopify `orders-paid` kan sende Microsoft purchase via UET
  Conversions API når
  `MICROSOFT_UET_CAPI_TOKEN`/`UTEKOS_MICROSOFT_UET_CAPI_TOKEN`/`MICROSOFT_UET_CAPI_ACCESS_TOKEN`
  (UET tag ApiToken per Microsoft Conversions API docs) finnes og
  checkout-attribusjonen inneholder `msclkid`.
  `MICROSOFT_ADS_ACCESS_TOKEN` er OAuth Ads API, ikke UET tag ApiToken.
- Shopify product create/update/delete webhooks invalidierer
  `products`, `product-{handle}` og `related-products-{handle}`
  med `revalidateTag(tag, { expire: 0 })`.
- Server-side provider-dispatch skjer bare via
  `marketing.event_ledger` og `ops.provider_dispatch_attempts`;
  umiddelbar parallell provider-dispatch er fjernet.
- Providerkøen har provider-idempotency, lease med `skip locked`,
  visibility-timeout, eksponentiell retry, permanent failure og
  dead letters. Køposter lagrer nå samtykkegrunnlag,
  datakvalitet, providerrespons og latency.
- Redis-app-logging er best-effort og lager ikke lenger
  produksjonsfeil ved utilgjengelig Redis.
- Redis-klienten feiler raskt ved tilkoblingstimeout, stopper
  reconnect på timeout og demper production-stack for
  Redis-timeouts slik best-effort logging ikke forurenser Vercel
  error logs.

### Kanonisk eventmatrise

| Kanonisk event   | Midlertidig Meta-navn | Klassifisering                                          | Browsertransport                                        |
| ------------------| -----------------------| ---------------------------------------------------------| ---------------------------------------------------------|
| `page_view`      | `PageView`            | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `view_item`      | `ViewContent`         | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `add_to_cart`    | `AddToCart`           | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI + Microsoft UET |
| `begin_checkout` | `InitiateCheckout`    | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI + Microsoft UET |
| `purchase`       | `Purchase`            | nødvendig ledger; provider kun med dokumentert samtykke | Google MP + Microsoft UET CAPI når token/msclkid finnes |
| `search`         | `Search`              | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `generate_lead`  | `Lead`                | marketing                                               | Google dataLayer/sGTM + Meta Pixel/CAPI                 |

### Verifisert lokalt

- `npx tsx --test src/components/cookie-consent/cookiebotConsent.test.ts`:
  grønn.
- Målrettet ESLint for endrede tracking- og consentfiler: grønn.
- `npm run tracking:smoke` er lagt til som deterministisk
  produksjonssmoke. Den verifiserer én CMP-loader, direkte sGTM
  web-loader, publiserte DPS-navn, fravær av valgfrie
  leverandører før samtykke, samtykketilbaketrekking og kanonisk
  Google-tag-destinasjon.
- Historisk 2026-06-11 var `npx tsc --noEmit --pretty false`
  blokkert av en eksisterende, uvedkommende feil i
  `src/app/api/analytics/visitor-event/route.test.ts`. Etter
  2026-07-07-herdingen er `pnpm exec tsc --noEmit` verifisert grønn.

### Gjenstående ekstern konfigurasjon

- Fjern stale `NEXT_PUBLIC_GTM_RESILIENT_SCRIPT_URL` fra Vercel
  Production og Preview, deploy appen og verifiser at `utekos.no`
  laster `/gtm.js?id=GTM-5TWMJQFP`.
- sGTM-endepunkter verifisert 2026-06-11 (`/healthz`,
  `/uc-consent-signals.js`, `/gtm.js`, `/ns.html` → 200).
- Verifiser banner, godta alle, avvis alle og tilbaketrekking på
  `utekos.no` etter deploy.
- Verifiser GA4 Realtime, Meta Pixel/CAPI-deduplisering og Google
  Ads GA4-importerte konverteringer med reelle
  produksjonshendelser.
- Supabase-migrasjon skal ikke kjøres blindt. Gjeldende lokale
  herdingmigrasjon er
  `20260707111433_harden_provider_dispatch_audit_statuses.sql`, men
  migration-history drift må repareres kontrollert før production
  push.
- Overvåk GA4, Meta og Ads i minst 48 timer etter vellykket
  produksjonssmoke.

### Drift og rollback

- Varsle på manglende CMP/banner, `/api/tracking-events`
  feil/latency, eldste køpost, retry-rate, dead letters,
  eventdekning, manglende Meta-identifikatorer og avvik mellom
  Shopify- og provider-purchases.
- Ved providerfeil: behold ledger og kø, stans aktuell
  provider-dispatch og replay dead letters med original
  `event_id` etter retting.
- Ved CMP- eller samtykkefeil: rollback deployment umiddelbart.
  Fail-closed-gates skal gjøre at valgfrie tjenester forblir av
  mens feilen undersøkes.
- Ved sGTM-feil: sett `GOOGLE_BROWSER_EVENT_TRANSPORT` tilbake
  til direkte, dokumentert server-only transport bare for
  eksplisitte server-events. Ikke aktiver direkte browser
  Measurement Protocol som nødløsning.

[Vendor-agnostic Metrics API setup](https://supabase.com/docs/guides/telemetry/metrics/vendor-agnostic.md)

## Tracking-domener og event collector

Les [AGENTS/tracking.md] Dato: 2026-06-08

## Tracking-domener og event collector

- `/api/tracking-events` på `utekos.no` er den
  Utekos-kontrollerte event collectoren for marketing-events.
- `portal.utekos.no` er kanonisk PostHog-ingest. Utekos eier
  DNS-navnet hos One.com, mens PostHog driver mottakstjenesten
  bak CNAME-en.
- Den parallelle Vercel-relayen på `/relay-MAhe` er fjernet.
- Meta, Google og andre annonseplattformer skal integreres som
  provider-adaptere bak `/api/tracking-events`, ikke via
  PostHog-proxien.
- `cloud.server.utekos.no` er produksjonsdomene for server-side GTM.
- Cookiebot CMP med domain group `f2145160-1ac5-4859-8385-36dc6327495f`
  er autoritativ samtykkekilde. Utekos sin event collector leser
  Cookiebot sin førsteparts-cookie `CookieConsent` server-side og
  lagrer normalisert status i event-ledgeret.
- Google-nettleserevents skal eies av sGTM når
  `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` aktiveres. Direkte GA4
  Measurement Protocol beholdes for Shopify-, offline- og
  server-only-events.
- `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` skal ikke aktiveres før
  sGTM-endepunkter, GTM Consent Initialisation og Cookiebot CMP er
  verifisert.
- Server-side GTM hostes på Google Cloud Run. Meta Signals Gateway
  skal ikke brukes fordi Meta allerede har direkte Pixel + CAPI.
- `CookieConsent` brukes som server-side samtykkesignal.
  Provider-dispatch og retry-kø opprettes bare for tjenester som
  hadde dokumentert kategori-samtykke da eventet ble mottatt.
- Cookiebot må publisere window-events (`CookiebotOnAccept` m.fl.)
  med kategorisamtykke. Uten synkronisert consent forblir valgfrie
  provider-events fail-closed.
- `/sporing` er kun en deaktivert `204`-sink for den tidligere
  server-side GTM-løsningen.

## Sentry metrics og profiling

Dato: 2026-06-08

- `@sentry/nextjs`, `@sentry/browser` og `@sentry/profiling-node`
  er låst til versjon `10.56.0`.
- Node-profilering bruker `nodeProfilingIntegration()`. Browser
  replay, tracing og profilering er deaktivert inntil de kan
  initialiseres eksplisitt bak Cookiebot statistics-tjenesten
  `Sentry Replay`.
- `Document-Policy: js-profiling` sendes på dokumentresponser for
  å aktivere browser-profilering.
- Sentry-konfigurasjonen bruker Vercels eksisterende
  `PERFORMANCE_SENTRY_*`-variabler med fallback til standard
  `SENTRY_*`-navn.
- En kontrollert metric `sentry_setup_verification` og
  profiling-trace `sentry-profiling-verification` er sendt med
  vellykket SDK-flush.
- Sentry sourcemaps er verifisert lastet opp til organisasjonen
  `utekos` og prosjektet `sentry-utekos-headless`.
- Produksjonsdeployment `dpl_CCVsFjDshb51GG2D4VQRmLjqmYrg` er
  aliasert til `utekos.no`.

## Løst hendelse: Supabase pooler brukte utdatert databasepassord

Dato: 2026-06-08

- Tracking-lageret er Supabase-prosjektet `supabase-pink-lens`
  med prosjektref `hkoawfbomhnzupcsdggb`, ikke Utekos
  Atlas-prosjektet.
- Supavisor-feilen kom fra den aktive produksjonsdeploymenten,
  som fortsatt brukte miljøvariabler fra før
  Supabase-databasepassordet ble korrigert i Vercel.
- Vercel Production-verdiene for både session pooler og
  transaction pooler er verifisert mot `hkoawfbomhnzupcsdggb`.
- Sist kjente fungerende deployment er redeployet med de
  oppdaterte miljøvariablene som
  `dpl_2X5JkmYPGLZBf3RYc5aEdaTvUzyu` og aliasert til `utekos.no`.
- En kontrollert Web Vital ble skrevet til `ops.web_vitals` i
  `supabase-pink-lens` og deretter slettet.
- Ingen nye Vercel runtime-feil ble registrert etter
  verifikasjonen.

## Løst hendelse: PostHog-prosjekt uten events

Dato: 2026-06-07

- Produksjonsappen brukte et PostHog project token som tilhørte
  et annet prosjekt enn det aktive prosjektet
  `posthog-celeste-mountain`.
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` i Vercel Production er
  korrigert til tokenet for det aktive prosjektet.
- Produksjonen er redeployet som
  `dpl_GA2tz1Y41HFjPivNKCjETmoYQEYE`.
- EU-relayen på `/relay-MAhe/capture/` er verifisert med
  HTTP 200.
- Verifikasjonseventet `utekos_production_relay_verification` er
  bekreftet mottatt i det aktive PostHog- prosjektet.
- PostHog fortsetter å respektere analyse-samtykke før vanlige
  browser-events sendes.

## Løst hendelse: Meta CAPI-token utløpt

Dato: 2026-06-07

- Produksjonens `META_ACCESS_TOKEN` og `META_SYSTEM_USER_TOKEN`
  er verifisert gyldige via Meta Graph API v24 `/debug_token`.
  Begge er uten utløpsdato.
- Permanente Meta-autentiseringsfeil skal markeres som `failed`
  uten automatisk retry. Payload beholdes for kontrollert
  re-køing etter tokenrotasjon.
- `META_CAPI_ENABLED=true` er aktiv i Production.
- `META_TEST_EVENT_CODE` og `NEXT_PUBLIC_META_TEST_EVENT_CODE` er
  fjernet fra Production, slik at live produksjonshendelser ikke
  sendes som Test Events.
- Live CAPI-hendelse er verifisert fra `utekos.no`.
- 64 bevarte Meta-hendelser ble replayet med originale
  `event_id`; alle 64 lyktes. 60 tilhørende dead-letter- poster
  er markert løst.

## Ressursisolering og SLO-policy

Dato: 2026-06-04

Hovedprinsipp: kritiske brukerflater og adminflater skal aldri
vente på sekundær logging, tracking, katalogsynk, full audit
eller analysearbeid. Tunge jobber skal kjøres isolert med lease,
idempotency, begrenset parallellitet, retry/backoff og synlig
job-status.

### Kritiske arbeidslaster

| Arbeidslast                            | Ressurser                                                      | SLO                                                                                                           |
| ----------------------------------------| ----------------------------------------------------------------| ---------------------------------------------------------------------------------------------------------------|
| Cart og checkout-forberedelse          | Shopify Storefront API, cart cache tags, cookies               | p95 under 1.5s for app-logikk. Tracking må ikke blokkere success-respons.                                     |
| Produkt-, collection- og search-flater | Next.js cache, Shopify Storefront API ved cache miss           | p95 under 1.2s ved cache hit. Cache miss skal bruke fallback, stale data eller kontrollert revalidering.      |
| Proxy og normal sidetrafikk            | Vercel Function, PostHog rewrite, intern logging ved behov     | Respons skal ikke vente på Redis, app-logg eller analytics-dispatch.                                          |
| Admin status/dashboard                 | Snapshot-lager, Merchant status snapshot, Redis eller database | p95 under 2s. Skal lese forhåndsberegnet status, ikke trigge full Shopify- eller Merchant-kataloglesing live. |

### Sekundære arbeidslaster

| Arbeidslast                | Ressurser                                 | SLO                                                                                                             |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| App-logging                | Redis/app logs                            | Best-effort. Skal ha kort timeout og kan droppes ved feil. Må aldri blokkere kritisk respons.                   |
| Browser/server tracking    | Meta CAPI, GA4/sGTM, Redis logs           | HTTP-respons under 300ms etter validering. Provider-dispatch kjøres i bakgrunn eller kø.                        |
| Newsletter-sideeffekter    | Resend, Shopify subscriber sync, tracking | Primær brukerbekreftelse returneres først. CRM, tracking og subscriber-sync kjøres separat med retry.           |
| Kontaktskjema-sideeffekter | Resend, Atlas-forwarding, Redis logs      | Brukerrespons avhenger kun av nødvendig innsending. Atlas/logging er sekundært og skal ikke gjøre flyten skjør. |

### Operasjonelle tunge jobber

| Arbeidslast                       | Ressurser                                                      | SLO                                                                                                     |
| --------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Google Merchant catalog sync      | Shopify Admin API, Google Merchant API, Vercel Function/worker | Fullført innen 15 min. Ingen overlappende kjøringer. Siste vellykkede sync skal være yngre enn 6 timer. |
| Meta catalog sync                 | Shopify Admin API, Meta Catalog API, Vercel Function/worker    | Fullført innen 5 min. Siste vellykkede sync skal være yngre enn 24 timer.                               |
| Full katalogaudit/statusberegning | Shopify Admin API, Google Merchant API, snapshot-lager         | Skal kjøres planlagt eller manuelt i bakgrunn. Dashboard skal bare lese siste snapshot.                 |

### Delte ressursregler

- Shopify Admin API brukes av katalogsynk, Merchant-status og
  subscriber-sync. Tunge jobber skal ha egne rate limits og må
  ikke dele live request-budsjett med kritiske flater.
- Redis brukes til app-logs og enkelte attribution-/statusdata.
  Logging er sekundært og skal alltid være timeout-beskyttet.
- Google Merchant, Meta og GA4/sGTM er eksterne
  providerressurser. Feil eller treghet hos disse skal ikke
  forplante seg til cart, checkout, produktflater eller
  admin-status.
- Vercel Functions i `arn1` skal ha tydelig runtime-policy: korte
  bruker-/dashboardruter, egne lange operasjonelle jobber og
  best-effort tracking/logging.
- Tunge jobber skal eksponere job-id, status, starttid, sluttid,
  feil og siste vellykkede kjøring.

### Akseptkriterier

- Ingen kritisk route/action venter på logging, tracking eller
  provider-dispatch som ikke er nødvendig for brukerresponsen.
- Dashboard/status leser snapshot og starter ikke full
  kataloginnhenting som del av vanlig statusrespons.
- Merchant og Meta sync har lease/idempotency før de regnes som
  produksjonsklare tunge jobber.
- Alle nye AI-, tracking-, katalog- og dashboardarbeidslaster må
  klassifiseres som kritisk, sekundær eller operasjonell tung
  jobb før implementering.
