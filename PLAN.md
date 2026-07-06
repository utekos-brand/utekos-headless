# PROJECT PLAN

## Status

STATUS: SGTM ER FLYTTET TIL NYTT GOOGLE CLOUD-PROSJEKT;
PRODUKSJONSDOMENET ER VERIFISERT GRØNT

## Shadcn MCP og cardproduction

Dato: 2026-06-18

- `utekos-shadcn-context` er utvidet som read-only MCP-overflate
  for den konkrete cardproduction-flaten:
  `src/components/cards/*`,
  `src/app/inspirasjon/cardproduction/*`,
  `src/app/inspirasjon/components/cards/*` og
  `src/app/inspirasjon/components/items/*`, i tillegg til
  `scripts/shadcn/academy/*`, `components.json`,
  `src/globals.css` og `src/components/ui/*`.
- Shadcn ChatGPT tunnelprofilen `utekos-chatgpt-shadcn` er
  initialisert lokalt og `npm run mcp:tunnel:doctor:shadcn`
  passerer. `npm run mcp:chatgpt:doctor` bekrefter
  shadcn-profilen, men samlet doctor feiler fortsatt når Docker
  Desktop ikke kjører fordi `live_ops`-profilen krever Docker.
- `src/app/inspirasjon/cardproduction/layout.tsx` skal kun være
  layout-wrapper. Synlig card-production-innhold ligger i
  `page.tsx` og `CardShowCase.tsx`.
- Cardproduction-fargenotat følger Canva-palettsporet: dyp
  maritim base, varm plomme/ganache-kontrast og naturkomplement i
  oliven-/skogfamilien, implementert med eksisterende
  OKLCH-tokens fremfor inline fargeverdier.

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

### Tracking-gjenoppretting 2026-06-11

- Usercentrics ruleset `9suQr3rGddL3Tb` er publisert med Google
  Analytics (`Statistikk`), Google Ads (`Markedsføring`) og
  Facebook Pixel (`Markedsføring`).
- Microsoft Clarity er flyttet til `Statistikk`. `PostHog.com` og
  én duplisert egendefinert PostHog er fjernet; én `PostHog` som
  `Statistikk` er beholdt.
- Usercentrics sitt faktiske DPS-navn for Meta-kanalen er
  `Facebook Pixel`; applikasjon, diagnostikk, smoke-test og
  Vercel-miljø skal bruke dette eksakte navnet.
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
- Produksjonsappen brukte fortsatt en gammel Usercentrics
  resilient-loader som serverte web-versjon `98`. Appen er endret
  til direkte `/gtm.js?id=GTM-5TWMJQFP` som standard; stale
  Vercel-override skal fjernes før produksjonsdeploy.

### Implementert lokalt

- Usercentrics CMP v3-loaderen kjøres i dokumenthodet med
  kanonisk rekkefølge: Consent Mode defaults →
  `uc-consent-signals.js` → autoblocker → loader.
- GTM (`GTM-5TWMJQFP`) lastes tidlig i `<head>` via synkron
  bootstrap og sGTM-endepunkt `cloud.server.utekos.no`; Consent
  Mode styrer tag-firing. dataLayer-pushes og
  Meta/PostHog/Chatbase m.fl. monteres fortsatt etter tjeneste-
  eller kategorisamtykke.
- GTM-noscript iframe peker på sGTM `ns.html`. Direkte Microsoft
  UET-loader og direkte Microsoft browser-events er fjernet fra
  aktiv flyt.
- Usercentrics `ucEvent` oppdaterer React-gates og Google Consent
  Mode uten reload. Endringer lagres i
  `marketing.consent_snapshots` med faktiske tilgjengelige
  identifikatorer.
- `/api/tracking-events` validerer en streng, versjonert
  Zod-kontrakt og avviser valgfri lagring fail-closed når verken
  Meta-, Google- eller Microsoft-samtykke kan dokumenteres.
- Browser-events bruker én sentral dispatcher. Google går til
  samtykkegatet dataLayer/sGTM. Meta Pixel og ledger/CAPI deler
  samme `event_id`. Microsoft UET er consent-gatet i samme
  dispatcher og sender dokumenterte lowercase actions
  (`add_to_cart`, `begin_checkout`, `purchase`) med `event_id`,
  `revenue_value`, `currency`, `ecomm_prodid` og lowercase
  `ecomm_pagetype`.
- Shopify `orders-paid` kan sende Microsoft purchase via UET
  Conversions API når
  `MICROSOFT_UET_CAPI_TOKEN`/`UTEKOS_MICROSOFT_UET_CAPI_TOKEN`
  finnes og checkout-attribusjonen inneholder `msclkid`.
  `MICROSOFT_ADS_DEVELOPER_TOKEN` er ikke brukt som CAPI-token.
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
| ---------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `page_view`      | `PageView`            | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `view_item`      | `ViewContent`         | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `add_to_cart`    | `AddToCart`           | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI + Microsoft UET |
| `begin_checkout` | `InitiateCheckout`    | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI + Microsoft UET |
| `purchase`       | `Purchase`            | nødvendig ledger; provider kun med dokumentert samtykke | Google MP + Microsoft UET CAPI når token/msclkid finnes |
| `search`         | `Search`              | statistics/marketing etter samtykke                     | Google dataLayer/sGTM + Meta Pixel/CAPI                 |
| `generate_lead`  | `Lead`                | marketing                                               | Google dataLayer/sGTM + Meta Pixel/CAPI                 |

### Verifisert lokalt

- `npx tsx --test src/components/cookie-consent/usercentricsConsentDiagnostics.test.ts`:
  grønn.
- Målrettet ESLint for endrede tracking- og consentfiler: grønn.
- `npm run tracking:smoke` er lagt til som deterministisk
  produksjonssmoke. Den verifiserer én CMP-loader, direkte sGTM
  web-loader, publiserte DPS-navn, fravær av valgfrie
  leverandører før samtykke, samtykketilbaketrekking og kanonisk
  Google-tag-destinasjon.
- `npx tsc --noEmit --pretty false` er blokkert av en
  eksisterende, uvedkommende feil i
  `src/app/api/analytics/visitor-event/route.test.ts`.

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
- Kjør Supabase-migrasjon
  `20260609090000_harden_provider_dispatch_observability.sql`.
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
- `cloud.server.utekos.no` er produksjonsdomene for
  Usercentrics-administrert server-side GTM.
- Usercentrics CMP v3 med ruleset-ID `9suQr3rGddL3Tb` er
  autoritativ samtykkekilde. Utekos sin event collector leser
  Usercentrics sin offisielle førsteparts-cookie
  `ucConsentAllowedDps` server-side og lagrer normalisert status
  i event-ledgeret.
- Google-nettleserevents skal eies av sGTM når
  `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` aktiveres. Direkte GA4
  Measurement Protocol beholdes for Shopify-, offline- og
  server-only-events.
- `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` skal ikke aktiveres før
  Usercentrics-containeren, custom domain, consent-signaler og
  GTM-containerne er verifisert.
- Usercentrics Server-Side Tracking med **sGTM Container** er
  valgt som administrert hosting. Cloud Run og Meta Signals
  Gateway skal ikke brukes fordi Meta allerede har direkte
  Pixel + CAPI.
- Usercentrics sin offisielle `ucConsentAllowedDps` brukes som
  server-side samtykkesignal. Provider-dispatch og retry-kø
  opprettes bare for tjenester som hadde dokumentert DPS-samtykke
  da eventet ble mottatt.
- Usercentrics må publisere window-eventet `ucEvent` med
  `consent_status` og tjenestenavn. Uten eventet forblir alle
  valgfrie provider-events fail-closed.
- `/sporing` er kun en deaktivert `204`-sink for den tidligere
  server-side GTM-løsningen.

## Sentry metrics og profiling

Dato: 2026-06-08

- `@sentry/nextjs`, `@sentry/browser` og `@sentry/profiling-node`
  er låst til versjon `10.56.0`.
- Node-profilering bruker `nodeProfilingIntegration()`. Browser
  replay, tracing og profilering er deaktivert inntil de kan
  initialiseres eksplisitt bak Usercentrics-tjenesten
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
| -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
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
