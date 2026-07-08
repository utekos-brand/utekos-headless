# FLOW - tracking, observability og kommersiell innsikt

Statusdato: 2026-07-08.

Dette dokumentet er den operative flytbeskrivelsen for hvordan Utekos skal samle inn,
lagre, levere og bruke analytics-, tracking- og observasjonsdata. Dokumentet er
bevisst delt i to:

1. Først beskrives den ønskede end-to-end-flyten slik den skal fungere når
  systemet utnyttes helt ut.
2. Deretter gjennomgås de samme trinnene på nytt med nåværende avvik, svakheter,
  aktive gap og lukkekriterier.

Målet er å gjøre det tydelig hvorfor data sendes til Supabase, PostHog,
annonseplattformer og observability-systemer, hva dataene faktisk brukes til,
hva som ikke er godt nok utnyttet ennå, og hvilke feil som må lukkes før flyten kan
regnes som komplett.

## Kort fasit

- Supabase er kanonisk tracking-, audit- og provider-lager. Det er her accepted
events, provider-kø, provider-respons, dead letters, consent snapshots,
attribution, web vitals og kald arkivering skal kunne etterprøves.
- PostHog er produkt- og webanalyse. Det skal brukes til adferdsforståelse,
funnel-analyse, CRO, session replay og produktinnsikt. Det skal ikke være
økonomisk fasit, provider-audit eller rå payload-lager.
- Redis er ikke analytics-lager. Redis brukes som kortlevd støtte for
attribusjon, dedupe og runtime state, spesielt `fbp`/`fbc`, `client_id` og
`msclkid` når server-events skal matches mot kjøp.
- Providerne bruker dataene til optimalisering og kontroll: Meta CAPI, Google
Measurement Protocol / GA4, Microsoft UET CAPI, Google Merchant Center,
Microsoft Shopping/Ads og Clarity.
- Nåværende hovedsvakhet er ikke at data ikke samles inn. Hovedsvakheten er at
hele feedback-loopen ikke er lukket: provider dead letters står uløst, PostHog
har for lite ferdig CRO-/commerce-operasjonalisering, og Supabase-rapportene er
for lite løftet til løpende varsling og beslutningsflater.



## 1. Målbildet: komplett end-to-end-flyt

```mermaid
flowchart TD
  visitor[Kunde / besøkende] --> consent[Cookiebot CMP]
  consent --> browser[Browser tracking hub]
  browser --> dl[Google dataLayer]
  browser --> pixels[Meta Pixel / UET / Clarity]
  browser --> posthog[PostHog produktanalyse]
  browser --> api[/api/tracking-events]

  api --> ledger[Supabase marketing.event_ledger]
  api --> queue[Supabase ops.provider_dispatch_attempts]
  ledger --> archive[analytics.event_ledger_archive]
  queue --> retry[/api/cron/retry-dispatch]
  queue --> deadletter[ops.dead_letter_events]
  deadletter --> replay[/api/cron/replay-dead-letter]

  retry --> meta[Meta CAPI]
  retry --> google[GA4 Measurement Protocol]
  retry --> microsoft[Microsoft UET CAPI]

  shopify[Shopify order webhook] --> redis[Redis attribution cache]
  redis --> serverPurchase[Server-side purchase dispatch]
  serverPurchase --> ledger
  serverPurchase --> queue

  merchant[Shopify catalog] --> gmc[Google Merchant Center]
  merchant --> msShopping[Microsoft Shopping]

  sentry[Sentry] --> ops[Operational diagnosis]
  vercel[Vercel] --> ops
  posthog --> insight[CRO / funnel / replay / web vitals]
  ledger --> insight
  ops --> action[Agent/MCP decision loop]
  insight --> action
```



Den ønskede flyten er enkel:

1. Brukeren gir eller nekter samtykke.
2. Nettleseren sender kun samtykkede events til riktige klientflater.
3. Førsteparts-API-et normaliserer og aksepterer tracking-events.
4. Supabase lagrer fasit, kø, provider-respons og revisjonsspor.
5. Providerne mottar kvalifiserte events for attribusjon og budoptimalisering.
6. PostHog bygger produktforståelse og CRO-innsikt fra trygge, eksplisitte events.
7. Sentry, Vercel, web vitals og provider health forklarer tekniske avvik.
8. MCP/agent-flaten leser status og gjør funn om til prioriterte handlinger.

Flyten er ikke ferdig før dataene blir brukt til konkrete beslutninger: kampanje-
diagnostikk, tracking-reparasjon, konverteringsoptimalisering, produktforbedring,
UX-innsikt og kapitalallokering.

## 2. Integrasjonenes rolle


| Integrasjon                   | Tenkt rolle                                            | Data inn                                                             | Data ut / bruk                                                      | Skal ikke brukes til                                        | Nåværende status                                                            |
| ----------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Cookiebot CMP                 | Samtykkekilde og legal gate                            | Brukerens consent state                                              | Google Consent Mode, UET consent, Clarity consentv2, service-gating | Å maskere tekniske feil som "privacy"                       | Aktiv i produksjon; HTML-sjekk fant Cookiebot og ingen Usercentrics-runtime |
| Browser tracking hub          | Samlet klientdispatch                                  | Produkt-, side-, interaksjons- og checkout-events                    | dataLayer, Meta Pixel, UET, PostHog, `/api/tracking-events`         | Ukontrollert autocapture eller PII                          | Aktiv; avhengig av korrekt samtykke og event-dekning                        |
| Supabase                      | Kanonisk ledger, queue, audit og read models           | Accepted events, provider attempts, consent, attribution, web vitals | Provider health, dead-letter summary, arkiv, agentdiagnostikk       | Produktanalyse alene eller rå brukerprofiler                | Aktiv og fylt med data; operasjonell feedback-loop er ikke lukket           |
| Redis                         | Kortlevd attribusjon/runtime state                     | `fbp`, `fbc`, Google `client_id`, `msclkid`, dedupe/idempotency      | Server-side purchase enrichment                                     | Langtidslagring, analysefasit eller rapportering            | Aktiv støttefunksjon; manglende identifiers gir skips/dead letters          |
| PostHog                       | Produktanalyse, webanalyse, funnel, replay, web vitals | Trygge pageviews, web vitals og eksplisitte commerce-events          | Innsikt, session replay, CRO og adferdsanalyse                      | Provider-audit, finansiell fasit, PII, rå provider payloads | Aktiv datainntak; mangler ferdig Utekos CRO-/commerce-dashboards            |
| GA4 / sGTM                    | Google-måling og consent-gated browser tagging         | Browser- og server-events                                            | GA4/Google Ads-import, datalayer-sjekk, Google-optimalisering       | Ukritisk dobbelttelling med Ads native tags                 | sGTM public endpoints er OK; Google Ads API-prober er fortsatt fail-closed  |
| Meta Pixel / CAPI             | Meta-attribusjon og budoptimalisering                  | Pixel og CAPI events, purchase, IDs                                  | Event Match Quality, Dataset Quality, ads learning                  | Skriveoperasjoner uten eksplisitt godkjenning               | Read-only Dataset Quality OK; gamle/uløste dead letters finnes fortsatt     |
| Microsoft Ads / UET / Clarity | Bing/Microsoft attribusjon, UET CAPI, Clarity          | UET browser/CAPI, consent, Clarity state                             | Ads readiness, campaign/ad insight, Clarity diagnose                | Kun en "UET endpoint" uten Ads-kontekst                     | Ads/account/campaign/ad-insight prober er OK; UET CAPI mangler token        |
| Google Merchant Center        | Produktfeed og Shopping-kvalitet                       | Shopify-katalog, GTIN, bilder, kategorier                            | Product status, Shopping eligibility, feedkvalitet                  | Tracking-lager                                              | Merchant API og API source er OK; kontopolicy må fortsatt verifiseres       |
| Sentry                        | Feilsporing og teknisk årsak                           | Server/edge/global/client errors                                     | Issues, request errors, stack traces                                | Produktanalyse eller session replay uten consent-oppsett    | Server/edge aktiv; Replay er ikke aktivert; Sentry MCP-probe fail-closed    |
| Vercel                        | Deploy, runtime og produksjonsstatus                   | Deployment metadata, runtime status                                  | Deploy-verifikasjon og produksjonsdiagnostikk                       | Provider-fasit                                              | Commerce doctor-verifisert; produksjons-HTML viser deployment-id            |
| MCP/agentflater               | Lesbar operasjonell kontrollflate                      | Supabase, PostHog, provider-prober, docs                             | Diagnose, gapregister, prioritering                                 | Skjulte provider-mutasjoner                                 | 28 commerce/tracking-verktøy OK; flere credential-gated prober fail-closed  |




## 3. Ønsket flyt steg for steg


| Steg                 | Ønsket tilstand                                                                                                       | Primær kilde / kodeflate                                      | Output som må eksistere                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 0. Consent           | Alle tracking- og replay-systemer starter fail-closed og åpnes kun med riktig service-/kategori-samtykke              | `CookieScript`, `CookiebotConsentProvider`, `cookiebotConfig` | Consent state i browser, provider consent updates, `marketing.consent_snapshots`      |
| 1. Browser capture   | Sidevisninger, produktvisninger, lister, CTA, scroll, add-to-cart, checkout og purchase intent fanges eksplisitt      | `dispatchMetaTrackingEvent`, PostHog helper, dataLayer        | Google dataLayer, Meta Pixel, UET, PostHog commerce-events, first-party tracking call |
| 2. Førsteparts API   | Events valideres, normaliseres og avvises fail-closed ved ugyldig payload eller samtykke                              | `/api/tracking-events` og tracking contracts                  | `marketing.event_ledger` og provider-dispatch rows                                    |
| 3. Supabase ledger   | Alle accepted events og provider attempts er etterprøvbare med tidsstempel, event-id, provider, status og skip reason | `marketing.event_ledger`, `ops.provider_dispatch_attempts`    | Provider health, dead-letter summary, audit trail                                     |
| 4. Provider dispatch | Kvalifiserte events leveres til Meta, Google og Microsoft med retry og korrekt statusklassifisering                   | retry-dispatch, provider adapters                             | `succeeded`, `retrying`, `dead_lettered`, `skipped_unqualified` med grunn             |
| 5. Shopify purchase  | Betalte ordrer kobles til Redis-attribusjon og sendes server-side til providerne uten dobbelttelling                  | `processOrderTrackingWithDependencies`                        | Purchase i ledger, provider attempts, Meta/Google/Microsoft purchase status           |
| 6. PostHog innsikt   | Samme adferd brukes til funnel, web vitals, session replay og CRO uten PII                                            | `PostHogProvider`, `PostHogConsentGate`, commerce helper      | Utekos dashboards, funnels, replay shortlist og web-vitals views                      |
| 7. Produktfeed       | Produktdata er gyldige, dedupliserte og koblet til Shopping-kilder                                                    | Merchant preflight, Shopify catalog sync                      | API source health, product counts, GTIN/category/image status                         |
| 8. Observability     | Tekniske feil, deploys og runtime-regresjoner kobles til tracking-avvik                                               | Sentry, Vercel, provider reports                              | Issues, deployment status, smoke evidence, alerting                                   |
| 9. Agentbeslutning   | MCP/agentlaget kan lese data og gi prioriterte, ikke-destruktive tiltak                                               | Commerce/tracking MCP, Supabase, PostHog                      | Gapregister, action plan, verifikasjonslogg                                           |




## 4. Nåværende verifisert status

Verifisert 2026-07-08 med lokale read-only-kommandoer, MCP/plugin-lesing og
produksjons-HTTP-sjekker.


| Område                | Funn                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Produksjons-CMP       | `https://utekos.no` returnerte 200 med normal browser headers. HTML inneholdt Cookiebot og ingen Usercentrics-runtime-treff i sjekken.                                                                              |
| Produksjonsdeploy     | HTML-sjekk viste deployment-id `dpl_HfZDgyCHYBrzG7Bo81XvqVSUFdxu`.                                                                                                                                                  |
| sGTM                  | `https://cloud.server.utekos.no/healthy` og `gtm.js?id=GTM-5TWMJQFP` returnerte 200.                                                                                                                                |
| Replay route          | `https://utekos.no/api/cron/replay-dead-letter` returnerte 401 uten hemmelighet, som bekrefter at ruten finnes og er secret-gated.                                                                                  |
| Supabase volum        | `marketing.event_ledger` ca. 10 584 rader, `ops.provider_dispatch_attempts` ca. 12 023, `ops.web_vitals` ca. 12 792, `marketing.consent_snapshots` ca. 9 717, `marketing.website_visitor_events` ca. 6 122.         |
| Ledger siste 7 dager  | Ca. 923 events. Størst volum: `PageView`, `ViewContent`, `ViewItemList`, `LandingScrollDepth`, `LandingSectionView`, `LandingCTAClick`, `AddToCart`, `InitiateCheckout`, `Purchase`.                                |
| Provider health       | Meta og Google har mange `succeeded`, men også uløste dead letters. Microsoft UET har `skipped_unqualified` med `missing_capi_token`.                                                                               |
| Dead letters          | 381 uløste dead letters i siste kontroll. 340 Google-rader mangler `client_id` og skal ikke replayes. Ferske Google `ga_error`-rader hadde `client_id`, men viste rå GS2 `session_id` i lagret payload; koden normaliserer nå GA4 session id før nye browser-events lagres/sendes. |
| Commerce/tracking MCP | `npm run mcp:commerce-tracking:doctor` passerte tool-surface-gaten med 28 read-only tools.                                                                                                                          |
| Live provider-prober  | Shopify, GA4, Vercel, public sGTM/GTM, Meta Dataset Quality, Microsoft UET endpoint, Microsoft Ads auth/account/campaign/ad insight, Microsoft Shopping Content og Microsoft Clarity var OK i siste doctor-kjøring. |
| Fail-closed prober    | Merchant Center MCP-proben, Google Ads-prober, PostHog project/event status i lokal commerce MCP, Sentry og GTM API workspace hadde fortsatt credential/scope-gated fail-closed status.                             |
| Merchant preflight    | Merchant API virker. API primary product source og autofeed er synlige. 16 managed products, 15 med GTIN. Kontopolicy må likevel verifiseres separat.                                                               |
| PostHog plugin        | Aktivt prosjekt har event-inntak. Siste 30 dager viste mye `$pageview` og `$web_vitals`, men få eksplisitte `utekos_*` commerce-events og ingen dedikerte Utekos CRO-/checkout-dashboard funnet i søk.              |
| Sentry                | Server/edge/global error-instrumentering finnes i kode. Client replay er ikke aktivert, og lokal Sentry-probe er fail-closed.                                                                                       |




## 5. Avvik mot ønsket flyt


| Steg                 | Hva som fungerer nå                                                                | Avvik / svakhet                                                                                                            | Hvorfor det betyr noe                                                                                                  | Lukkekriterium                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Consent           | Cookiebot er aktiv i produksjon og kode oppdaterer Google, UET og Clarity consent. | Full produksjons-smoke må fortsatt validere alle service-navn mot Cookiebot admin og provider behavior.                    | Feil service-navn kan gi enten tapt tracking eller uønsket tracking.                                                   | Browser-smoke viser korrekt denied/accepted for Google, Meta, Microsoft, Clarity, PostHog og Sentry Replay før endring regnes som trygg. |
| 1. Browser capture   | Klienthub sender dataLayer, Meta, UET, PostHog og first-party events.              | PostHog viser lavt volum av eksplisitte `utekos_*` commerce-events sammenlignet med pageviews/web vitals.                  | Produktanalyse får ikke nok detaljert commerce-grunnlag til CRO.                                                       | PostHog har stabile `utekos_view_item`, `utekos_add_to_cart`, `utekos_begin_checkout`, `utekos_purchase` og funnel-dashboard.            |
| 2. Førsteparts API   | Supabase får accepted events og provider rows.                                     | Kvaliteten på identifier-capture er ikke god nok for alle provider-dispatcher.                                             | Google dead letters for manglende `client_id og` Microsoft skips viser at events ikke alltid kan optimalisere bidding. | Missing identifier rates synker til avtalt terskel og kvalifiseres som `skipped_unqualified` der det er forventet.                       |
| 3. Supabase ledger   | Ledger, queue, health views, dead-letter views og arkiv finnes.                    | Supabase-data brukes for lite som løpende operasjonell alarmflate.                                                         | Data samles inn, men for sent eller manuelt omsatt til handling.                                                       | Ekstern alert/dashboard finnes for queue, dead letters, provider fail rate, purchase delivery og web vitals.                             |
| 4. Provider dispatch | Meta/Google har store mengder `succeeded`; retry/dead-letter-ruter finnes.         | 381 uløste dead letters. De fleste er historiske Google `missing_client_id`; resterende må sorteres etter `ga_error`, Meta unknown error og invalid payload. Replay-ruten blokkerer nå manglende identifiers, invalid payload og utløpte provider-vinduer. | Providerne mangler noen events eller får feilklassifisert teknisk gjeld.                                               | Dead letters er klassifisert: reparert, resolved, eller bevisst `skipped_unqualified`; rapporten går grønn eller har forklarte terskler. |
| 5. Shopify purchase  | Purchase-flowen kan lagre ledger og dispatch-attempts.                             | Microsoft UET CAPI purchase mangler token. Meta/Google purchase-kvalitet avhenger av Redis-attribusjon og identifiers.     | Purchase-events er de viktigste signalene for budoptimalisering og kapitalallokering.                                  | Provider purchase smoke viser Meta CAPI, GA4 MP og Microsoft UET CAPI med riktige ids, dedupe og status.                                 |
| 6. PostHog innsikt   | PostHog mottar pageviews og web vitals, og init er consent-gated/masket.           | Dedikerte CRO-, checkout-, UTM- og revenue-flater er ikke etablert. Lokal commerce MCP har PostHog fail-closed.            | Data blir liggende som rå analyse i stedet for å drive beslutninger.                                                   | PostHog project/event-prober er grønne, og dashboards/funnels brukes i ukentlig CRO-/trackinggjennomgang.                                |
| 7. Produktfeed       | Merchant API preflight er grønn, API source og autofeed er synlige.                | Kontopolicy/Misrepresentation-status er ikke bevist grønn i fersk kontroll, og dual source kan fortsatt gi styringsrisiko. | Shopping-eligibility og produktdistribusjon kan være begrenset selv om feeden teknisk prosesseres.                     | Merchant UI/API-policystatus dokumenteres grønn, og ønsket kildeeierskap mellom API source og autofeed er avklart.                       |
| 8. Observability     | Sentry server/edge/global error finnes; Vercel-proben er grønn.                    | Sentry Replay er ikke aktivert og issue-probe er fail-closed.                                                              | Kritiske frontend-/checkoutfeil kan mangle replay-kontekst.                                                            | Sentry org/project/issue-probe er grønn, og Replay er enten bevisst aktivert med Cookiebot-gate eller eksplisitt parkert.                |
| 9. Agentbeslutning   | MCP doctor passerer tool-surface og flere provider-prober er grønne.               | Flere read-only prober mangler credentials/scopes: Google Ads, GTM API workspace, Sentry og lokal PostHog.                 | Agentlaget får hull i "single pane of glass" og kan ikke alltid skille reelle feil fra manglende tilgang.              | Credential-gated prober er enten grønne eller dokumentert fail-closed med nøyaktig eier og neste steg.                                   |




## 6. Hvor dataene går, og om de utnyttes godt nok



### Supabase

Data sendes til Supabase fordi det er eneste sted som kan være intern fasit for
hva appen aksepterte, hva som ble forsøkt sendt, hva providerne svarte, og hva
som må repareres. Det er riktig arkitektur.

Det som fungerer:

- `marketing.event_ledger` viser accepted tracking-events.
- `ops.provider_dispatch_attempts` viser provider-kø og provider-resultater.
- `ops.provider_dispatch_health` og `ops.dead_letter_summary` gir read models for
drift.
- `marketing.consent_snapshots`, `ops.web_vitals`,
`marketing.website_visitor_events` og `marketing.attribution_events` gir
ekstra innsikt og revisjon.
- `analytics.event_ledger_archive` og pg_cron-arkivering finnes for kald lagring.

Det som ikke er godt nok:

- Dead-letter-opprydding er fortsatt manuell og rød.
- Det finnes rapportskript, men ikke nok bevis på permanent dashboard/alert-loop.
- Flere tabeller er schema-only eller underutnyttet, blant annet deler av
`partner`, `analytics` og `leads`.
- Radvolum alene sier lite uten årsak, provider, replay-policy og konsekvens.

Konklusjon: Supabase brukes riktig som lager, men ikke godt nok som kontinuerlig
operasjonell styringsflate.

### PostHog

Data sendes til PostHog fordi Supabase ikke skal være produktanalyseverktøyet.
PostHog skal svare på spørsmål som:

- Hvor faller brukere fra?
- Hvilke produktlister, CTA-er og landingssider skaper handling?
- Hvilke sessions bør sees i replay?
- Hvilke web-vitals-problemer korrelerer med lavere intent?
- Hvilke UTM-/kampanjeinnganger gir faktisk bedre produktadferd?

Det som fungerer:

- PostHog init er consent-gated.
- Autocapture er av.
- Pageviews er manuelle.
- Replay er strengt masket når det brukes.
- URL-er renses for query string.
- Commerce-helperen sender trygge, eksplisitte properties.

Det som ikke er godt nok:

- Det er ikke funnet dedikert Utekos-dashboard for funnel, checkout, produkt,
landing page, UTM eller replay-prioritering.
- Volumet av eksplisitte `utekos_*` commerce-events er lavt sammenlignet med
pageviews og web vitals.
- Lokal commerce MCP har PostHog project/event-status fail-closed, selv om
plugin-tilgang viser at prosjektet har data.

Konklusjon: PostHog er riktig verktøy, men er ennå ikke fullt utnyttet som
CRO- og kundeinnsiktsmotor.

### Redis

Redis skal ikke være analyse- eller rapporteringslager. Redis er runtime-støtte
for å knytte senere server-events til tidligere browser-attribusjon.

Riktig bruk:

- Midlertidig lagring av `fbp`/`fbc`, Google `client_id`, `msclkid` og
event-/order-dedupe.
- Beriking av Shopify purchase-webhooks før server-side provider dispatch.

Svakhet:

- Når Redis mangler attribution identifiers, kan provider-events bli
`skipped_unqualified` eller dead-lettered.
- Dette er ikke en Redis-feil alene; det er en capture-/consent-/identifier-flow
som må måles end-to-end.

Konklusjon: Redis er en nødvendig koblingsmekanisme, men må vurderes gjennom
identifier coverage og purchase match rate, ikke radtall.

## 7. Prioritert gap-register


| Prioritet | Gap                                       | Nåværende evidens                                                                        | Neste handling                                                                             | Gate                                                                                                     |
| --------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| P0        | Uløste provider dead letters              | 381 unresolved dead letters; replay-plan viser første 120 som `requires_attribution_repair` | Klassifiser historisk `missing_client_id` som ikke-replaybar, undersøk resterende `ga_error`, Meta unknown error og invalid payload separat | `npm run ops:provider-dispatch-report -- --fail-on-alerts` må enten gå grønn eller ha godkjente terskler |
| P0        | Microsoft UET CAPI purchase mangler token | `microsoft_uet` viser `skipped_unqualified` med `missing_capi_token`                     | Skaff/sett UET tag ApiToken, ikke Ads OAuth-token                                          | Purchase smoke viser Microsoft UET CAPI `succeeded` eller bevisst disabled                               |
| P0        | Merchant policy / feed ownership          | Merchant API preflight OK, men policy-status ikke ferskt bevist grønn                    | Verifiser Merchant Center policy og avklar API source vs autofeed                          | Merchant UI/API policy evidence lagres i runbook                                                         |
| P1        | PostHog CRO-loop mangler                  | Data finnes, men få `utekos_*` commerce-events og ingen dedikerte dashboards funnet      | Bygg dashboards/funnels for landing, product, checkout, campaign og replay shortlist       | Ukentlig innsiktsflate kan svare på hvor og hvorfor brukere faller fra                                   |
| P1        | Supabase-operasjonalisering               | Warehouse fylles, men rapporter er fortsatt for manuelle                                 | Lag alert/dashboard for queue, fail rate, dead letters, purchases, consent og web vitals   | Varsel eller dashboard brukes som fast beslutningsflate                                                  |
| P1        | Google Ads/GTM API read-only prober       | GA4 og public sGTM OK, men Google Ads/GTM API workspace er fail-closed                   | Rett credentials/scopes eller dokumenter blokkering                                        | Prober skiller tydelig mellom teknisk feil og manglende tilgang                                          |
| P1        | Identifier coverage                       | Google dead letters domineres av manglende `client_id`; Microsoft CAPI mangler token/ids | Mål coverage for `client_id`, `fbp`, `fbc`, `msclkid` per steg                             | Coverage-rapport per eventtype og consent state                                                          |
| P2        | Sentry Replay                             | Sentry server/edge aktiv, Replay ikke aktivert                                           | Beslutning: aktivere med Cookiebot statistics gate eller eksplisitt parkere                | Replay status dokumentert; ingen antatt dekning                                                          |
| P2        | Underbrukte tabeller                      | Flere partner-/analytics-/lead-tabeller står tomme                                       | Fjern, parker eller koble til konkret bruk                                                 | Ingen schema-only dataløfter uten eier                                                                   |




## 8. Verifikasjonskommandoer

Bruk disse ved endringer i tracking, providerflyt, MCP, Supabase eller
observability.

```bash
npm run mcp:build
npm run mcp:doctor
npm run mcp:commerce-tracking:doctor
npm run ops:provider-dispatch-report -- --json
npm run ops:provider-dispatch-report -- --fail-on-alerts
node scripts/ops/dead-letter-replay-plan.mjs --limit=40
npm run merchant:preflight
```

Ved nettleser-/produksjonssmoke må følgende bevises før endring regnes som
ferdig:

- Cookiebot denied/accepted state.
- Google Consent Mode og dataLayer-event.
- Meta Pixel og/eller CAPI evidence.
- Microsoft UET browser og eventuell CAPI evidence.
- Clarity Consent API V2.
- PostHog init, masking og manuelt pageview/commerce-event.
- Supabase row i ledger og provider attempts.
- Provider dashboard/API-status der credentials tillater det.

Live provider- eller produksjonsmutasjoner krever eksplisitt godkjenning før
kjøring. Dette inkluderer deploy, GTM publish, Supabase schema mutation, provider
resource write, campaign write og replay av dead letters.

## 9. Historikk: foreldet eller løst innhold

Disse punktene skal ikke lenger stå som aktive avvik uten ny evidens:

- "Produksjon kjører fortsatt gammel Usercentrics-runtime" er foreldet. Siste
produksjons-HTML-sjekk viste Cookiebot og ingen Usercentrics-runtime.
- "Vercel deployment status probe er ikke verifisert" er foreldet for siste
commerce doctor. Vercel-proben var OK.
- "Microsoft Ads account/campaign/ad insight er ikke verifisert" er foreldet
for siste commerce doctor. Microsoft Ads auth readiness, account access,
campaign status og Ad Insight var OK.
- Gamle resolved Meta-token-expired rows skal ikke telles som aktive feil uten
unresolved status.
- Server-side dead-letter replay-ruten eksisterer og er secret-gated, men dette
  betyr ikke at dead letters er løst. Ruten er nå hardnet slik at den ikke
  requeuer Google-rader uten `client_id`, invalid payload eller provider-events
  utenfor replay-vinduet.
- Chatbase skal behandles som legacy. Ny AI-kundeservice må planlegges separat
og skal ikke blandes inn som aktiv analytics-flyt.

Punkter som fortsatt ikke kan markeres løst uten ny kontroll:

- Merchant Center kontopolicy og eventuell Misrepresentation-status.
- Google Ads API og GTM API workspace credentials/scopes.
- Sentry issue-probe og eventuell Sentry Replay.
- Full commerce purchase smoke mot Meta CAPI, GA4 Measurement Protocol og
  Microsoft UET CAPI.
- PostHog-dashboards/funnels som faktisk brukes til CRO og kundeinnsikt.



## 10. Neste praktiske rekkefølge

1. Lukk provider dead-letter-registeret med klassifisering, ikke blind replay.
2. Avklar Microsoft UET CAPI-token og purchase delivery.
3. Verifiser Merchant Center policy og kildeeierskap.
4. Bygg PostHog CRO-/commerce-dashboard og koble til ukentlig analyseflyt.
5. Løft Supabase provider health til fast alert/dashboard.
6. Rydd credential-gated MCP-prober slik at agentlaget kan skille tilgangsfeil
   fra reelle trackingfeil.
7. Ta beslutning om Sentry Replay med korrekt Cookiebot-gate.
