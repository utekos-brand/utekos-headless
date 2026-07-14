# PROJECT PLAN

## Status

STATUS 2026-07-14: `origin/main` ER ENESTE PRODUKSJONSKANON.
LOKAL `main`, `origin/HEAD` OG VERCEL-PRODUKSJON PEKER PÅ SAMME
COMMIT `400d72485`. ALT TILSIKTET LOKALT ARBEID ER BEVART PÅ
NAVNGITTE RELEASE- ELLER ARKIVBRANCHES. RELEASE-ENHETENE ER
ISOLERT FRA `origin/main`: GIT-OPERASJONER, KLARNA-STOREFRONT,
MICROSOFT MERCHANT, POSTHOG SDK, STOREFRONT-TILGJENGELIGHET,
MCP-/DRIFTSVERKTØY OG KILDEHYGIENE. S/GTM/SUPABASE ER STABLET
ETTER DEN KANONISKE GIT-RELEASEN FOR Å FJERNE KJENTE
DOKUMENT-/PACKAGE-MERGEKONFLIKTER UTEN Å BLANDE INN POSTHOG.
DE ER IKKE ALTERNATIVE PRODUKSJONSFASITER; DE SKAL VERIFISERES OG
MERGES TIL DEN ENE KANONISKE LINJEN I GODKJENT REKKEFØLGE. SEKS
ELDRE AGENT-/PAGESPEED-BRANCHES FRA FØR REPOSITORY-MIGRERINGEN ER
BEVART SOM LOKALE
`archive/pre-migration/*`-REFERANSER. DEN ELDRE HYTTE-/SESONG-
BRANCHEN ER BEVART SOM `archive/needs-reconciliation/*` FOR EGEN
FRONTENDMODERNISERING OG BROWSER-VERIFIKASJON. ALLE TILHØRENDE
WORKTREES ER FJERNET; BARE HOVEDWORKTREE-EN GJENSTÅR. INGEN PUSH, PR-MERGE,
VERCEL-DEPLOY, PROVIDER-WRITE, GTM-PUBLISH ELLER SUPABASE-
MUTASJON ER UTFØRT I DENNE GIT-AVSTEMMINGEN.

### Releaseavstemming 2026-07-14

- Git-modellen er nå entydig: `origin/main` er produksjonskilden,
  lokal `main` skal alltid være ren og identisk, og kandidatbranches
  kan bare være foran fordi de inneholder arbeid som ennå ikke er
  verifisert og merget.
- Ulike branch-SHA-er er nødvendig for pågående arbeid og er ikke
  Git-drift. Drift betyr her at lokal `main`, `origin/main`, Vercels
  production branch eller deploymentens Git-kilde er uenige. De fire
  er nå enige. En releasebranch inneholder tilsiktet arbeid med en
  gjenstående releaseport, aldri «tilfeldige endringer».
- `origin/codex/reconcile-tracking-release` peker på nøyaktig samme
  commit som `origin/main` og har 0 unike commits. Den er redundant;
  sletting vil bare fjerne branchnavnet og påvirker ikke kode,
  produksjon eller historikk. Remote-sletting krever eksplisitt
  godkjenning.
- Den tidligere `sync-and-deploy.mjs`-flyten er avviklet. Den kunne
  stage hele arbeidsområdet, pushe GitHub og deretter starte en ekstra
  direkte Vercel production deploy. `npm run repo:sync` er nå
  fast-forward-only og utfører aldri commit, push eller deploy.
- `codex/release-git-operations` er første release: 8 filer som gjør
  `repo:sync` fast-forward-only, pensjonerer kombinert sync/deploy og
  dokumenterer GitHub-merge til `main` som eneste production-trigger.
  Teststatus: 5/5 grønn; den pensjonerte kommandoen avslutter med exit 1.
- `codex/release-klarna-product-cards` er 9 filer og 2 commits. Den
  flytter Express Checkout fra produktdetalj til produktkort, deler én
  idempotent SDK-loader og feiler Vercel-build lukket ved tom Client
  Identifier. Typecheck og build 95/95 er grønne; kontrollert browser-
  smoke viste 3 knapper, 1 SDK-last og 0 sidefeil på 390 og 1440 px.
  Reell provider-preview krever verifisert Client Identifier og origins.
- `codex/release-microsoft-merchant-feed` er 7 filer og 1 commit.
  Feedtester 3/3, lint, TypeScript og build 96/96 er grønne; request-
  time-dynamikk hindrer den tidligere prerender-hengen.
- `codex/release-posthog-sdk` er bare `package.json` og
  `pnpm-lock.yaml`. PostHog 1.399.2, helpertester 3/3, TypeScript,
  commerce doctor og build 95/95 er grønne. Ingen Google-/MCP-
  dependencies eller runtimekonfigurasjon er blandet inn.
- `codex/release-storefront-accessibility` er 9 filer og 1 commit.
  Den gjør størrelsevelgeren tastaturnavigerbar med roving tabindex og
  synlig valgt-markør, retter modal-/popover-kontrast og lagrekkefølge,
  gir ikonbasert fjerning et tilgjengelig navn og gjør handlekurv-
  fjerning optimistisk med rollback. TypeScript, målrettet lint og build
  95/95 er grønne. Browser-smoke på 390 og 1440 px beviste tastaturfokus,
  mobil-/desktop-layout, 17,1:1 mørk og 18,0:1 lys modal-kontrast,
  dialog inne i åpen handlekurv og både avbryt- og bekreftflyten uten
  applikasjonsfeil. Cookiebot viser det forventede localhost-varselet.
- `codex/release-mcp-operations` er en separat MCP-/driftsrelease uten
  PostHog-, Klarna-, Microsoft-feed- eller storefront-kode og uten de
  20+ ubrukte Google-pakkene fra den brede kandidaten. Den inkluderer
  de tidligere ignorerte, men nødvendige runtimefilene og kun tomme
  env-maler. Frossen install, endret-kode-lint, TypeScript og build
  95/95 er grønne. MCP build genererte 52 servere; basisdoctor,
  commerce doctor med 28/28 tools, Shopify read-only, Codex bridge,
  offisiell Google Analytics MCP 0.6.0 med 9/9 tools og live rapport,
  privat Analytics-proxy og syv sGTM-loaderendepunkter er grønne.
  Samlet ChatGPT-profildoctor er ikke totalgrønn fordi den eldre
  Insight-surface feiler og Docker Desktop ikke kjører; de nye
  profilene passerer separat.
- `codex/release-source-hygiene` har bare to ikke-runtimeendringer:
  fjerner en duplisert filsti-kommentar og retter `;;` til `;` i den
  allerede anvendte migrasjonen `20260711190423`. Linked migration
  list bekrefter samme versjon lokalt og remote. Linked Supabase lint
  for prosjektets applikasjonsskjemaer er grønn, og ingen Supabase-
  mutasjon er utført. En separat `extensions.index_advisor`-feil finnes
  fortsatt hvis Supabase sitt interne `extensions`-skjema lintes.
- `codex/production-candidate-20260714` bevarer de 58 reelle lokale
  forskjellene mot dagens `origin/main`, inkludert PostHog-/package-,
  MCP-, Microsoft feed-, Klarna UI- og øvrige frontendendringer. De er
  tilsiktede produksjonskandidater. Alle 58 filstier er nå klassifisert
  i egne releaser eller som eksplisitt avvist. Den eneste avviste
  endringen er `minimumReleaseAgeExclude` for `posthog-js@1.399.2`:
  frossen install passerer uten dette supply-chain-unntaket, så det
  skal ikke svekke policyen i produksjon. Branchen er kun et tapsfritt
  arkiv og skal ikke deployeres samlet.
- En midlertidig lokal integrasjonsaudit kombinerte alle syv
  storefront-/plattformreleaser og `codex/sgtm-remediation`. To
  dokumentkonflikter ble løst eksplisitt; runtimefilene hadde ingen
  konflikt. Frossen install uten supply-chain-bypass, 111 endrede
  tester, MCP build med 52 servere, MCP/commerce doctor, lint av alle
  endrede kodefiler, TypeScript og en Vercel-lignende build med 99/99
  statiske sider var grønne. Auditreferansen ble fjernet etter at
  resultatet var dokumentert; den ble ikke pushet eller deployet.
- `codex/sgtm-remediation` bevarer tracking-, receipt-, refund-, sGTM-
  tooling- og Supabase-kandidatene stablet etter
  `codex/release-git-operations`. PostHog er fortsatt separat.
  Review-diff-artifacts er bevart separat i en navngitt lokal stash og
  er ikke runtimekode. Kode, tester, TypeScript, build, Supabase lint og
  read-only providerstatus er grønne. Migrasjonen
  `20260712120000`, receipt-secret/Vercel-env, Cloud Run-hardening og
  GTM-publisering må eksplisitt godkjennes og verifiseres før runtime-
  releasen kan signeres av.
- Den eldre hytte-/sesong-branchen kunne ikke rebases mekanisk uten å
  velge mellom gammel og aktiv UI i tre layout-/animatorfiler. Rebasen
  ble abortert tapsfritt, den allerede anvendte trackingcommiten ble
  identifisert som duplikat, og resten er arkivert til en separat,
  browser-verifisert frontendavstemming.

- Full build var ikke blokkert av MDX eller typed routes i den
  kanoniske builden. En stale `.next` Turbopack-filcache utløste
  lokal worker-`ENOENT`; cachen er regenerert, og både den aktive
  worktree-en og den rene releasen bygger alle ruter grønt.
- MDX-/typed-route-feilene kom fra en separat `--webpack`/
  `--debug-build-paths`-diagnose med ufullstendige genererte
  rutetyper. `next typegen` etterfulgt av `tsc --noEmit` er grønn.
- De fire omtalte migrasjonene var allerede registrert i Supabase,
  men filene lå ucommittet i en separat lokal worktree. Supabase
  og Git har uavhengig historikk; dette er årsaken til avviket.
- PostHog `1.399.2` er isolert og verifisert i
  `codex/release-posthog-sdk`. Den brede kandidatens øvrige Google-/
  MCP-dependencies forblir separat og skal ikke følge PostHog-releasen.
- Vercel-preview `dpl_2kJH2QCPpsaaxx5oDBKD9SuhUt6j` er `READY` og
  beviste robust Klarna SDK-initialisering i den gamle
  produktsideplasseringen. Den beviste ikke den tilsiktede UI-flyttingen
  til produktkort.
- Vercel production deployment `dpl_BL1dJauLSVXy5KNNhPd4FjRXGwmT`
  fra `main` SHA `400d7248557cf2cdfd9825106b0859a3aa18c4c3`
  er `READY` og ble aliased til `utekos.no`/`www.utekos.no`.
  Live `/produkter` har ingen Klarna SDK eller express-knapper på
  produktkortene. Live produktdetalj laster SDK-en, men Klarna-
  containeren er tom og ingen knapp er synlig. Den tidligere påstanden
  om at Klarna-knappen var rendret og aktiv var feil. Provider-
  rapporten passerte med 0 alerts.

## Telemetry- og plattformherding

Dato: 2026-07-07

Deploy-/migrasjonsrekkefølge er nå kanonisk dokumentert i
[DEPLOYMENT.md](DEPLOYMENT.md). Den skal leses før alle production
deploys, Supabase-mutasjoner, env-endringer, GTM-publiseringer,
trackingendringer og providerendringer.

Kommersiell styringsplan for Supabase, BigQuery, PostHog, Vercel
Workflows, MCP/agenter og kundechatbot ligger i
[COMMERCIAL_INTELLIGENCE_PLAN.md](COMMERCIAL_INTELLIGENCE_PLAN.md).

### Cookiebot CMP-migrering

Dato: 2026-07-08

Usercentrics CMP v3-runtime er fjernet fra applikasjonen. Cookiebot
CMP (Usercentrics-produkt) er nå autoritativ samtykkekilde.

- Domain group ID: `f2145160-1ac5-4859-8385-36dc6327495f`
- Loader: `https://consent.cookiebot.com/uc.js` uten auto-blocking som
  normaltilstand; appens egne consent-gater eier blokkeringen
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

- Merge [PR #13](https://github.com/utekos-brand/utekos-headless/pull/13) og
  Vercel production deploy
- Vercel env: sett `NEXT_PUBLIC_TRACKING_SGTM_ORIGIN=https://cloud.server.utekos.no`
  (eller `cloud.server.utekos.no` — normaliseres i runtime); fjern
  `NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN` og øvrige `NEXT_PUBLIC_USERCENTRICS_*`
- `TRACKING_SMOKE_BASE_URL=https://utekos.no npm run tracking:smoke` etter deploy
- `npm run tracking:commerce-smoke` mot prod
- GTM Quick Preview: bekreft at Consent Initialisation beholdes og at
  den dupliserende `Cookiebot CMP`-taggen `126` fjernes, siden appen
  eier den eneste CMP-loaderen
- Cookiebot Admin: scanner må matche tjenestenavn i `cookiebotConfig.ts`

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
- Shopify Admin GraphQL er koblet som Supabase-side commerce bridge i
  private `commerce`-schema. Production-migrasjonene
  `20260708153048_shopify_graphql_bridge.sql` og
  `20260708161740_fix_shopify_collect_pg_net.sql` er kjørt. Shopify
  credentials ligger i Supabase Vault som `shopify_store_domain` og
  `shopify_admin_api_token`, ikke i SQL eller tabeller.
- Full Shopify-historikk er importert fra query
  `updated_at:>2000-01-01T00:00:00Z`: 804 ordre og 1222 linjevarer
  ligger i `commerce.shopify_order_snapshots` og
  `commerce.shopify_order_line_items`. Importen brukte 7 GraphQL
  request-logger totalt, med historikk fra 2022-06-09 08:15:05 UTC
  til 2026-07-08 13:58:40 UTC.
- `commerce.shopify_order_attribution_readiness` viser etter full
  import 535 ordre med `missing_ga_client_id`, 263 ordre med
  `missing_paid_click_id`, 4 ordre `ready_for_provider_repair` og 2
  ordre med `missing_meta_browser_ids`. Attribute-key count over de
  804 ordrene: `_fbp` 363, `_ga_session_id` 271, `_ga_client_id` 269,
  `_fbc` 213, `gclid` 6, `gbraid` 2 og `msclkid` 2.
- Supabase production har nå varig checkout-attribution snapshot:
  migrasjonen `20260708161741_checkout_attribution_snapshots.sql`
  opprettet `marketing.checkout_attribution_snapshots` og
  `marketing.checkout_attribution_lookup_tokens`. Tabellene har RLS,
  service-role-only grants og token-indeks for bredere lookup enn bare
  `checkout_token`/`cart_token`.
- Kode er oppdatert slik `/api/checkout/capture-identifiers`
  skriver samme attribution-payload til Redis og Supabase snapshot.
  `orders-paid` attribution lookup har også Supabase snapshot-fallback
  hvis Redis bommer eller er utløpt. Dette er deployet i production
  med Vercel deployment
  `utekos-headless-55g9vsbve-utekos-marketing-group.vercel.app`.
- Kode er oppdatert for fremtidige ordre: eksisterende Shopify
  carts får nå marketing-attributter synket via Storefront
  `cartAttributesUpdate` etter cart line add/update og i
  `/api/checkout/capture-identifiers` før checkout. Dette dekker
  tilfeller der `_ga`, `_fbp`, `_fbc` eller paid click-id dukker opp
  etter at carten først ble opprettet. Dette er deployet i production,
  men full commerce purchase-smoke gjenstår før runtime-flyten er
  signert av.
- `npm run ops:identifier-coverage-report` er lagt til som read-only
  P0-rapport for Shopify attribution readiness, checkout snapshot-
  coverage, provider purchase delivery og uløste dead letters.
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
- `npm run build`: grønn. Etter lokal, ikke-deployet fontopprydding er nyeste
  build-logg fri for `Google Sans Flex`/`Google Sans` fallback-warnings.
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
- Supabase production query bekrefter at `commerce`-schemaet finnes
  med Shopify GraphQL request-logg, order snapshots, line items og
  attribution-readiness-view. Første Shopify GraphQL-call returnerte
  HTTP 200, 0 GraphQL-feil, `has_next_page=true`, og importerte 5
  ordre.
- Etter full historikk-paginering er siste Shopify-side samlet med
  `has_next_page=false`; production har nå 7 Shopify GraphQL request
  logs, 804 ordre og 1222 linjevarer i `commerce`.
- Supabase production migration history matcher lokal etter
  `20260708161741_checkout_attribution_snapshots.sql`.
- Supabase production schema dump bekrefter
  `marketing.checkout_attribution_snapshots` og
  `marketing.checkout_attribution_lookup_tokens` med primærnøkler,
  FK, indekser, RLS og service_role `select/insert/update`.
- Rollback-smoke mot production bekreftet at snapshot- og token-insert
  validerer, og at testdata ikke ble liggende etter `rollback`.
- `TRACKING_COMMERCE_SMOKE_SYNTHETIC_IDS=1 npm run tracking:commerce-smoke`
  2026-07-08T20:41Z beviste ny samtykket checkout-capture i production.
  Smoke-eventen `ic_1783543301472_3da1da34-77f5-43e8-acde-5094a11c434f`
  fikk checkout snapshot med primary storage token, Microsoft `msclkid`,
  GA client/session id, Meta `fbp` og external id. `npm run
  ops:identifier-coverage-report` 2026-07-08T20:42Z viser nå 1 snapshot-rad
  med 100% dekning for GA client/session id, Meta `fbp`, external id,
  Microsoft `msclkid` og paid click id. Rapporten klassifiserer Microsoft
  UET `missing_capi_token` som historisk radgjeld fordi nyeste purchase-rad
  fra før smoken er `missing_attribution`. Full purchase delivery er fortsatt
  ikke bevist før en faktisk ny testordre eller ny live purchase-event-id
  finnes etter grønn checkout-capture.
- Provider dead-letter-registeret ble klassifisert/lukket i production
  2026-07-08T20:33Z uten provider replay: 340
  `requires_attribution_repair`, 28
  `historical_ga4_session_id_payload_bug`, 11
  `outside_provider_replay_window`, 2 `invalid_payload` og 1
  `historical_ga4_page_location_payload_bug`. Etterpå var
  `npm run ops:provider-dispatch-report -- --fail-on-alerts` grønn
  med 0 active queue rows, 0 failed/dead-lettered rows, 0 unresolved
  dead letters og 0 alerts. `npm run ops:dead-letter-replay-plan --
  --limit=500` viste 0 unresolved og 0 replay-kandidater. Denne
  statusen ble foreldet 2026-07-10: 48 nye Google `ga_error`-rader
  er uløste fordi `page_location` oversteg 100 tegn. Lokal retting
  fjerner query/hash og utelater fortsatt overlang verdi. Den
  tilbakevendende Vercel-cronen er fjernet lokalt fordi replay-ruten
  er manuell og godkjenningsgated. Produksjonsdeploy, observasjon av
  nye events og eventuell engangsreplay krever separate porter.
- GA4 browser fallback sender nå `page_location` uten query/hash og
  dropper ugyldige/overlange URL-er før Measurement Protocol.
- Constraint-query bekrefter at `provider_dispatch_attempts` tillater
  `skipped_unqualified` og har `dispatch_mode`-sjekk for
  `server_retry`, `server_direct` og `client_observed`.
- `npx supabase db lint --linked --schema marketing,ops,analytics`:
  grønn, "No schema errors found".
- `npx supabase db lint --linked --schema commerce,marketing,ops,analytics`:
  grønn, "No schema errors found".
- Secret scan av `.env.mcp.example`, `.mcp.json`,
  `config/mcp/credentials.manifest.json`,
  `config/mcp/servers.base.json`, `mcp.json` og `.vscode/mcp.json`
  fant ikke de eksponerte token-/konto-strengene.

### Ikke utført med vilje

- Browser commerce smoke er kjørt for `select_item`, `add_to_cart`,
  `begin_checkout`, provider rows, Cookiebot/Clarity/PostHog evidence og
  checkout attribution snapshot. Full purchase-smoke er ikke kjørt fordi den
  krever faktisk testordre eller konkret
  `TRACKING_COMMERCE_SMOKE_PURCHASE_EVENT_ID` etter ny checkout-capture.
- Tokenrotasjon hos Google/Meta/Microsoft er ikke utført fra repoet.
  Lokale eksponerte verdier er fjernet; providerrotasjon må gjøres
  separat dersom verdiene var ekte.
- `npm run lint` er fortsatt ikke en ren completion gate. Den feiler
  på bred, eksisterende repo-gjeld utenfor denne herdingpakken.

### Neste gates

- Følg [DEPLOYMENT.md](DEPLOYMENT.md) for release order ved videre
  arbeid: Supabase først når runtime krever nye databaseobjekter,
  deretter Vercel production deploy ved runtime-endringer, deretter
  provider-/tracking-smoke.
- Denne tråden har eksplisitt godkjent og gjennomført Supabase
  production-mutasjon for telemetry-herdingen, Shopify-historikk og
  checkout-attribution snapshot samt dead-letter-klassifisering.
  Vercel production deployment
  `utekos-headless-55g9vsbve-utekos-marketing-group.vercel.app` ble
  opprettet 2026-07-08T18:55:14.894Z og er `READY` for target
  `production`. Det som fortsatt mangler er full provider-/commerce-smoke
  og en reell checkout-capture som skriver snapshot-rad, ikke selve
  deployen.
- GA4 BigQuery-linken er aktiv for property `489598217`, men
  BigQuery-datasettet `analytics_489598217` finnes ikke ennå i
  `project-c683eb2c-20ae-4ec2-ac3`. `npm run
  ops:ga4-bigquery-readiness` 2026-07-08T20:48Z bekreftet dette read-only
  med `ga4_bigquery_dataset_missing`, 0 `events_*` og 0
  `events_intraday_*`. BigQuery Wrapper/read models skal vente til
  datasettet og minst én GA4 event-tabell finnes.
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
  (uten auto-blocking som normaltilstand).
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
