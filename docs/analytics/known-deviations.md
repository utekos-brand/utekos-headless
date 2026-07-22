# Known deviations

## DEV-001

- **Priority:** P0
- **Description:** Every accepted browser event and transaction
  webhook schedules a full provider registry drain.
- **Evidence:** `createBrowserEventRouteHandler.ts:16-29`;
  `runRegisteredProviderOutboxBatch.ts:21-39`; registered
  provider-event workers in `providerOutboxWorkerRegistry.ts`
  (includes `microsoft_uet:purchase` as of 2026-07-20).
- **Consequence:** One request can claim unrelated backlog,
  execute every registered worker claim, compete with cron and
  move queue drainage into the request deployment lifecycle.
- **Systems:** All `/api/events/*`, purchase/refund webhooks,
  Vercel functions, Supabase outbox.
- **Recommended next action:** Make request-path dispatch
  targeted to the attempt IDs created by that transaction, or
  remove immediate dispatch and rely on cron.
- **Target task:** Oppgave 1, first code change.

## DEV-002

- **Priority:** P2 (downgraded from P1 on 2026-07-20 after GTM
  Admin + EMQ)
- **Description:** Residual Meta tag reconciliation is limited to
  operational follow-ups (currency warning, dedupe Overlap), not
  destination mismatch.
- **Evidence:** Browser + dataset agree on `1092362672918571`;
  sGTM version 29 has no Meta CAPI Gateway tag; browser uses
  openbridge3. EMQ live. Dedupe tracked as DEV-020.
- **Consequence:** Low residual risk of misreading server GTM as
  Meta CAPI path.
- **Systems:** Server GTM, Meta Events Manager, Meta adapters.
- **Recommended next action:** Keep inventory artifact current;
  pursue DEV-020 for dedupe Overlap.
- **Target task:** Documentation/ops hygiene (not Oppgave 1
  blocker).

## DEV-003

- **Priority:** P1 (downgraded from P0 on 2026-07-20 — design
  gate, not dispatch blocker)
- **Description:** Canonical snake_case and historical/provider
  PascalCase names coexist in ledger/attempt data.
- **Evidence:** Live ledger distribution contains `page_view` and
  `PageView`, `view_item` and `ViewContent`, `purchase` and
  `Purchase`, plus legacy custom names. Current claimers use
  canonical names. Live 7d Meta provider window is
  PascalCase-only.
- **Consequence:** Historical rows can be unclaimable; blind
  repair/replay can duplicate provider events.
- **Systems:** `event_ledger`, provider attempts, adapters, GTM.
- **Recommended next action:** Freeze the name/destination matrix
  and decide explicit historical disposition per name; no bulk
  rename/replay.
- **Target task:** Oppgave 1 design gate (after dispatch
  isolation).

## DEV-004

- **Priority:** P1
- **Description:** Generic success always persists
  `accepted_unverified`, although provider finality differs.
- **Evidence:** `runProviderOutboxWorker.ts:45-58`;
  `markAcceptedUnverified`; only Google has status
  reconciliation.
- **Consequence:** Meta/Microsoft API acceptance and Google
  pending diagnostics are operationally indistinguishable until
  secondary fields are inspected.
- **Systems:** Outbox status model, dashboards, alerts.
- **Recommended next action:** Add provider-owned completion
  semantics such as pending diagnostics, accepted terminal and
  provider-confirmed success without rewriting the generic
  worker.
- **Target task:** Oppgave 1 after dispatch isolation.

## DEV-005

- **Priority:** P1 (env/regression watch — not currently
  validate-only)
- **Description:** Data Manager can be switched to validate-only
  via `GOOGLE_DATA_MANAGER_VALIDATE_ONLY`; executed ingestion is
  the current production mode and must not be flipped without
  approval.
- **Evidence:** Env name present on Vercel Production. Live 7d:
  majority `validation_result.validate_only='false'` including
  purchase 2026-07-20T21:45Z; historical `true` rows end
  2026-07-18 (`DEPLOYMENT.md` temporary gate). Status cron
  filters `validate_only=false`.
- **Consequence:** Accidental `true` would stop real Ads
  ingestion while still producing `accepted_unverified`
  validation receipts.
- **Systems:** Google adapter/config, Vercel env, provider health
  reporting.
- **Recommended next action:** Keep Production `false`; alert if
  new rows show `validate_only=true`; any mode change is
  approval/deployment-gated.
- **Target task:** Continuous env gate (separate from Oppgave 1
  code).

## DEV-006

- **Priority:** P1
- **Description:** Google diagnostics claim scans lack a
  request-ID index; outbox claim lacks event-name alignment.
- **Evidence:** Live `pg_indexes` and safe EXPLAIN.
- **Consequence:** Status polling and multi-worker backlog
  processing scale through avoidable scans.
- **Systems:** Supabase `provider_dispatch_attempts`.
- **Recommended next action:** Benchmark and propose partial
  composite indexes; apply only through an approved migration.
- **Target task:** Oppgave 1/2 schema change with explicit
  approval.

## DEV-007

- **Priority:** P2 (downgraded from P1 on 2026-07-20 after
  purchase journey proof)
- **Description:** Microsoft UET CAPI is purchase-only;
  non-purchase Microsoft server events remain
  `blocked_no_worker`.
- **Evidence:** Purchase journey `#6ULWCDZT5` / event
  `cdd83f38-3b67-4aac-9142-1bb42cea45ab` → `microsoft_uet`
  `accepted_unverified`. Catalog non-purchase Microsoft still
  blocked; 222 historical skipped rows remain historical.
- **Consequence:** Full-funnel Microsoft server coverage is
  incomplete; purchase CAPI path is proven.
- **Systems:** Microsoft UET/CAPI, catalog, outbox.
- **Recommended next action:** Decide whether to expand beyond
  purchase; keep ApiToken env healthy.
- **Target task:** Separate Microsoft funnel expansion after
  Oppgave 1.

## DEV-008

- **Priority:** P1
- **Description:** The app owning `SHOPIFY_ADMIN_API_TOKEN` has
  zero app-scoped webhook subscriptions, yet purchases keep
  reaching the ledger (including the verified Stapper journey via
  browser/webhook path that produced ledger + outbox rows).
- **Evidence:** Shopify Admin GraphQL 2025-07
  `webhookSubscriptions(first:50)` empty (2026-07-20). Purchase
  `#6ULWCDZT5` produced ledger + google/meta/microsoft_uet
  attempts at 2026-07-20T21:45Z — proves purchase ingestion, not
  which transport (browser vs webhook).
- **Consequence:** Webhook routes may receive little/no
  production traffic; capture may depend on browser path.
- **Systems:** Shopify app configuration, purchase/refund routes.
- **Recommended next action:** Check Vercel access logs for
  `/api/shopify/webhooks/*` / `/api/webhooks/*`, then register
  subscriptions deliberately or document browser-only capture.
- **Target task:** Ops prerequisite (not Oppgave 1 code blocker).

## DEV-009

- **Priority:** P1
- **Description:** Supabase session connection exhaustion affects
  consent and web-vitals persistence.
- **Evidence:** Vercel `EMAXCONNSESSION` runtime error groups.
- **Consequence:** Adjacent telemetry writes can be lost and
  shared database capacity can degrade tracking reliability.
- **Systems:** Vercel functions, Supabase pooler.
- **Recommended next action:** Isolate connection usage and
  verify transaction-mode/bounded pooling.
- **Target task:** Separate reliability task.

## DEV-010

- **Priority:** P1
- **Description:** Consent snapshots stop after the 2026-07-15
  reset.
- **Evidence:** Live max snapshot date and operating contract.
- **Consequence:** Historical consent table must not be described
  as an active current consent audit stream.
- **Systems:** Cookiebot, consent snapshot route, warehouse.
- **Recommended next action:** Decide whether canonical
  event-embedded snapshots are sufficient or restore a bounded
  consent audit writer.
- **Target task:** Consent architecture decision.

## DEV-011

- **Priority:** P2
- **Description:** Generic persistence lives in
  `postgresCanonicalPageViewStore.ts`.
- **Evidence:** `postgresCanonicalEventStore` implementation plus
  page-view alias.
- **Consequence:** File naming encourages accidental deletion and
  hides reuse.
- **Systems:** All canonical acceptance paths.
- **Recommended next action:** Rename/move only after imports and
  tests are updated; no behavior change.
- **Target task:** Oppgave 1 cleanup after functional changes.

## DEV-012

- **Priority:** P2
- **Description:** PR 44 is open despite its logic already
  existing on main.
- **Evidence:** PR diff/merge state and shared mapping/jitter
  source.
- **Consequence:** Merge can regress the generic refactor or
  duplicate tests.
- **Systems:** GitHub workflow.
- **Recommended next action:** Confirm equivalent tests then
  close as superseded with approval.
- **Target task:** Repository hygiene.

## DEV-013

- **Priority:** P3 (mostly resolved)
- **Description:** Previous GTM IDs in planning text are stale;
  canonical IDs are now documented.
- **Evidence:** Active web `GTM-5TWMJQFP`; server `GTM-M8GT97CV`
  verified; prior `GTM-WZ4R3PQL`/`GTM-PGTJ3FJ` fail probes.
- **Consequence:** Residual risk only if agents follow old
  planning docs outside `docs/analytics`.
- **Systems:** Documentation/GTM.
- **Recommended next action:** Grep/replace stale IDs in
  non-canonical planning files when touched.
- **Target task:** Documentation hygiene.

## DEV-014

- **Priority:** P2
- **Description:** Data Manager historical request-ID coverage is
  incomplete.
- **Evidence:** The request-ID coverage query observed 3,501
  Google rows with request ID and 2,594 without; a separate live
  provider query observed three fewer Google rows because the
  audit did not hold one repeatable-read snapshot.
- **Consequence:** Older accepted rows cannot receive per-request
  diagnostics.
- **Systems:** Google status reconciliation.
- **Recommended next action:** Classify pre-request-ID history as
  historical terminal/unknown; do not synthesize IDs.
- **Target task:** Operational data policy.

## DEV-015

- **Priority:** P2
- **Description:** Dead-letter total fell by 47 relative to the
  previous observation.
- **Evidence:** Prior 1,174 versus live 1,127.
- **Consequence:** Retention/deletion/admin cleanup provenance is
  unknown.
- **Systems:** `ops.dead_letter_events`, audit controls.
- **Recommended next action:** Reconcile audit
  logs/migration/admin actions.
- **Target task:** Warehouse governance.

## DEV-016

- **Priority:** P3
- **Description:** Event-specific collector wrappers are highly
  repetitive.
- **Evidence:** Thin `*CollectorTransport.ts` files delegate to
  one generic factory.
- **Consequence:** Maintenance overhead, but explicit typed
  endpoints improve discoverability.
- **Systems:** Browser analytics.
- **Recommended next action:** Consider generated/static
  definitions only after behavior and ownership are stable.
- **Target task:** Later refactor.

## DEV-017

- **Priority:** P1
- **Description:** Google Ads destination `AW-18180376403` is
  live in browser traffic despite the documented policy that
  native Google Ads conversion tags remain excluded.
- **Evidence:** Browser smoke 2026-07-20 observed
  `pagead2.googlesyndication.com/ccm/collect` pings carrying
  `tid=AW-18180376403` both pre-consent (cookieless, `npa=1`,
  `gcs=G100`) and post-consent (`gcs=G111`). No `AW-` tag exists
  in the published web GTM payload, so the destination is most
  plausibly configured on the `GT-MKRLF5WK` Google tag.
- **Consequence:** Potential double-counting risk against
  GA4-imported conversions — the exact risk the exclusion policy
  exists to prevent — and an undocumented active ad destination.
- **Systems:** Google tag configuration, Google Ads, consent
  surface.
- **Recommended next action:** Identify where `AW-18180376403` is
  configured (Google tag settings in GTM or Google Ads-side
  linking), verify whether conversion actions are attached, and
  reconcile with the GA4-import conversion policy before any
  change.
- **Target task:** Oppgave 1 prerequisite.

## DEV-018

- **Priority:** P1
- **Description:** A concurrent branch replays Meta purchases
  through backfill ledger rows with **new** event IDs.
- **Evidence:** Ledger rows
  `backfill:meta-purchase-replay:shopify_order...` are paired
  with browser `purchase:<uuid>` rows sharing `occurred_at` but
  carrying different `event_id` values. The script
  `scripts/ops/force-resend-meta-purchases-jul19.ts` exists only
  on branch `fix/meta-fbc-durable-click-ids` (c6c88efaf). Three
  Meta attempts from the backfill are `accepted_unverified`.
- **Consequence:** Meta dedupe requires identical event name
  **and** event ID; a replay with a new event ID cannot
  deduplicate against the original browser Purchase and can
  double-count revenue in Meta.
- **Systems:** `event_ledger`, Meta adapters, concurrent branch
  work.
- **Recommended next action:** Coordinate with the owner of
  `fix/meta-fbc-durable-click-ids`; any replay must reuse the
  original `event_id` or be explicitly accepted as incremental.
  Do not merge the branch before this is resolved.
- **Target task:** Oppgave 1 design gate.

## DEV-019

- **Priority:** P2
- **Description:** Meta Pixel logs
  `Invalid parameter format for currency` in production.
- **Evidence:** Browser console warning during smoke on the
  product page 2026-07-20; the pixel's ViewContent payload
  appears to carry a malformed `currency` value.
- **Consequence:** Meta may drop or degrade value/currency on
  affected browser events, reducing value-based optimization
  quality.
- **Systems:** Browser Meta tag/dataLayer contract.
- **Recommended next action:** Inspect the GTM Meta tag's
  currency variable mapping against the dataLayer contract;
  currency must be a three-letter ISO 4217 string.
- **Target task:** Oppgave 1.

## DEV-020

- **Priority:** P1
- **Description:** Meta browser/server deduplication is **not
  proven** and Events Manager reports ViewContent dedupe as not
  set up.
- **Evidence (2026-07-20):** Events Manager Deduplication for
  `1092362672918571` — ViewContent: «Deduplication has not been
  set up» / improve event ID coverage; PageView, AddToCart,
  InitiateCheckout: «Still Parsing Your Data». Graph
  `dataset_quality` omits `dedupe_key_feedback` (docs
  `dedup_key_feedback` is a nonexisting field). Test Events
  (`TEST46149`) showed separate browser and server ViewContent
  rows with different `event_id`s and products — channel reach
  only, not shared-ID dedupe. Probe:
  `.agent-artifacts/analytics/meta-dedupe-field-probe-2026-07-20.json`.
- **Consequence:** Risk of double-counting or weak event coverage
  for redundant Pixel + CAPI ViewContent until Overlap/`event_id`
  parity is proven in Events Manager.
- **Systems:** Browser Meta Pixel (GTM), Meta CAPI adapters,
  Events Manager Dataset Quality.
- **Recommended next action:** Deferred remediation — prove one
  live product-view with identical Pixel `eventID` and CAPI
  `event_id`, then re-check Deduplication Overlap. Do not block
  Oppgave 1 or UET CAPI on a Test Events script.
- **Target task:** Separate Meta dedupe remediation after
  Oppgave 1.

## DEV-021

- **Priority:** P1
- **Status:** CODE_FIXED_AWAITING_DEPLOY (2026-07-22 CE-5.2D)
- **Description:** Marketing-consented `page_view` could persist
  with URL/`click_id` `fbclid` while `browser_id.fbp` and
  `browser_id.fbc` were empty (landing race before ParamBuilder
  cookies). Live 7d: 265 such rows, all with `has_fbp=0`;
  contributes to ~50–54% PageView Click ID coverage of *all*
  PageViews.
- **Evidence:** pink-lens 7d query; fix evidence
  `docs/analytics/evidence/ce-5.2d-page-view-landing-fbp-fbc.md`;
  DEC-015.
- **Consequence:** Weak Meta match keys on first PageView; later
  funnel events looked healthier because cookies existed.
- **Systems:** `acceptCanonicalPageView`,
  `ensureCanonicalMetaBrowserIds`, `/api/meta/parameter-context`,
  first-party `_fbp`/`_fbc`.
- **Recommended next action:** Merge/deploy CE-5.2D; re-measure
  `pct_fbc_given_fbclid` and `has_fbp=0` for marketing `page_view`.
- **Target task:** CE-5.2D.

## Previously requested hypotheses

| Hypothesis                                               | Verdict                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Generic store in page-view-named file                    | Confirmed                                                                                                     |
| Global outbox dispatch from request path                 | Confirmed                                                                                                     |
| Common `accepted_unverified`                             | Confirmed                                                                                                     |
| Google permanent-error history                           | Confirmed and currently resolved/classified                                                                   |
| Meta destination mismatch                                | Refuted (web payload/dataset agree; sGTM has no Meta CAPI Gateway tag; browser uses openbridge3)              |
| Mixed event naming                                       | Confirmed in warehouse history; refuted for the live 7-day Meta provider window (PascalCase only)             |
| Open Data Manager PR                                     | Confirmed open; superseded/conflicting                                                                        |
| Missing shop-scoped subscriptions prove missing webhooks | Refuted as a valid inference; app-scoped list now verified empty for this app token, delivery path unresolved |
