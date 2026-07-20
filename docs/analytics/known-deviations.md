# Known deviations

## DEV-001

- **Priority:** P0
- **Description:** Every accepted browser event and transaction webhook schedules a full provider registry drain.
- **Evidence:** `createBrowserEventRouteHandler.ts:16-29`; `runRegisteredProviderOutboxBatch.ts:21-39`; registered provider-event workers in `providerOutboxWorkerRegistry.ts` (includes `microsoft_uet:purchase` as of 2026-07-20).
- **Consequence:** One request can claim unrelated backlog, execute every registered worker claim, compete with cron and move queue drainage into the request deployment lifecycle.
- **Systems:** All `/api/events/*`, purchase/refund webhooks, Vercel functions, Supabase outbox.
- **Recommended next action:** Make request-path dispatch targeted to the attempt IDs created by that transaction, or remove immediate dispatch and rely on cron.
- **Target task:** Oppgave 1, first code change.

## DEV-002

- **Priority:** P1 (downgraded from P0 on 2026-07-20)
- **Description:** Meta destination/tag state is not fully reconciled across web GTM, server GTM and Events Manager.
- **Evidence:** Browser side now verified: published web payload, source/config and the live dataset all agree on `1092362672918571`; Graph API shows the dataset actively receiving (7d SERVER 3959 / BROWSER 1838) with only PascalCase names in the current window. Browser events route via CAPI Gateway (openbridge3). Remaining unknown: server GTM internals and the alleged paused CAPI Gateway tag (blocked by GTM MCP OAuth identity).
- **Consequence:** Residual risk is confined to the server container; a hidden server destination mismatch or paused tag could still affect dedupe.
- **Systems:** Server GTM, Meta Events Manager, Meta adapters.
- **Recommended next action:** Re-authenticate the GTM MCP with the correct Google account and complete the server-container half of the three-source proof.
- **Target task:** Oppgave 1 prerequisite.

## DEV-003

- **Priority:** P0
- **Description:** Canonical snake_case and historical/provider PascalCase names coexist in ledger/attempt data.
- **Evidence:** Live ledger distribution contains `page_view` and `PageView`, `view_item` and `ViewContent`, `purchase` and `Purchase`, plus legacy custom names. Current claimers use canonical names.
- **Consequence:** Historical rows can be unclaimable; blind repair/replay can duplicate provider events.
- **Systems:** `event_ledger`, provider attempts, adapters, GTM.
- **Recommended next action:** Freeze the name/destination matrix and decide explicit historical disposition per name; no bulk rename/replay.
- **Target task:** Oppgave 1 design gate.

## DEV-004

- **Priority:** P1
- **Description:** Generic success always persists `accepted_unverified`, although provider finality differs.
- **Evidence:** `runProviderOutboxWorker.ts:45-58`; `markAcceptedUnverified`; only Google has status reconciliation.
- **Consequence:** Meta API acceptance and Google pending diagnostics are operationally indistinguishable until secondary fields are inspected.
- **Systems:** Outbox status model, dashboards, alerts.
- **Recommended next action:** Add provider-owned completion semantics such as pending diagnostics, accepted terminal and provider-confirmed success without rewriting the generic worker.
- **Target task:** Oppgave 1 after dispatch isolation.

## DEV-005

- **Priority:** P1
- **Description:** Data Manager production is validate-only.
- **Evidence:** Runtime/config audit; stored validation receipts and reconciliation code.
- **Consequence:** Successful validation is not proof that events reach the advertising destination.
- **Systems:** Google adapter/config, provider health reporting.
- **Recommended next action:** Decide activation criteria and provider smoke plan; changing mode is approval/deployment-gated.
- **Target task:** Separate approved release after Oppgave 1.

## DEV-006

- **Priority:** P1
- **Description:** Google diagnostics claim scans lack a request-ID index; outbox claim lacks event-name alignment.
- **Evidence:** Live `pg_indexes` and safe EXPLAIN.
- **Consequence:** Status polling and multi-worker backlog processing scale through avoidable scans.
- **Systems:** Supabase `provider_dispatch_attempts`.
- **Recommended next action:** Benchmark and propose partial composite indexes; apply only through an approved migration.
- **Target task:** Oppgave 1/2 schema change with explicit approval.

## DEV-007

- **Priority:** P1 (downgraded from P0 on 2026-07-20 after purchase worker land)
- **Description:** Microsoft UET CAPI is purchase-only in code; non-purchase Microsoft server events remain `blocked_no_worker`, and production purchase smoke is not yet proven.
- **Evidence:** `microsoft_uet:purchase` registered; catalog purchase `serverOutbox: active`; page_view/view_item/cart Microsoft still blocked; historical 222 skipped rows remain until new qualified purchases after deploy.
- **Consequence:** Microsoft paid-media optimization still lacks full-funnel server coverage and live purchase CAPI proof until deploy + smoke.
- **Systems:** Microsoft UET/CAPI, catalog, outbox.
- **Recommended next action:** Deploy with UET ApiToken on Vercel Production; run consent-gated Microsoft-click purchase smoke; then decide whether to expand beyond purchase.
- **Target task:** Microsoft purchase smoke after approved tracking release.

## DEV-008

- **Priority:** P1
- **Description:** The app owning `SHOPIFY_ADMIN_API_TOKEN` has zero app-scoped webhook subscriptions, yet purchases keep reaching the ledger.
- **Evidence:** Shopify Admin GraphQL 2025-07 `webhookSubscriptions(first:50)` returned empty nodes (verified 2026-07-20). 16 purchase ledger rows in 7d; recent rows come from the browser purchase route and the `meta-purchase-replay` backfill (DEV-018), not proven webhook deliveries.
- **Consequence:** The `orders-paid`/`refunds-create` webhook routes may be receiving no production traffic; purchase capture may silently depend on the browser path alone, losing server-side authority for order truth.
- **Systems:** Shopify app configuration, purchase/refund routes.
- **Recommended next action:** Determine whether any other app/custom app is subscribed and delivering to these routes (Vercel access logs for `/api/webhooks/*`), then either register subscriptions deliberately or document the browser-only capture decision.
- **Target task:** Oppgave 1 prerequisite.

## DEV-009

- **Priority:** P1
- **Description:** Supabase session connection exhaustion affects consent and web-vitals persistence.
- **Evidence:** Vercel `EMAXCONNSESSION` runtime error groups.
- **Consequence:** Adjacent telemetry writes can be lost and shared database capacity can degrade tracking reliability.
- **Systems:** Vercel functions, Supabase pooler.
- **Recommended next action:** Isolate connection usage and verify transaction-mode/bounded pooling.
- **Target task:** Separate reliability task.

## DEV-010

- **Priority:** P1
- **Description:** Consent snapshots stop after the 2026-07-15 reset.
- **Evidence:** Live max snapshot date and operating contract.
- **Consequence:** Historical consent table must not be described as an active current consent audit stream.
- **Systems:** Cookiebot, consent snapshot route, warehouse.
- **Recommended next action:** Decide whether canonical event-embedded snapshots are sufficient or restore a bounded consent audit writer.
- **Target task:** Consent architecture decision.

## DEV-011

- **Priority:** P2
- **Description:** Generic persistence lives in `postgresCanonicalPageViewStore.ts`.
- **Evidence:** `postgresCanonicalEventStore` implementation plus page-view alias.
- **Consequence:** File naming encourages accidental deletion and hides reuse.
- **Systems:** All canonical acceptance paths.
- **Recommended next action:** Rename/move only after imports and tests are updated; no behavior change.
- **Target task:** Oppgave 1 cleanup after functional changes.

## DEV-012

- **Priority:** P2
- **Description:** PR 44 is open despite its logic already existing on main.
- **Evidence:** PR diff/merge state and shared mapping/jitter source.
- **Consequence:** Merge can regress the generic refactor or duplicate tests.
- **Systems:** GitHub workflow.
- **Recommended next action:** Confirm equivalent tests then close as superseded with approval.
- **Target task:** Repository hygiene.

## DEV-013

- **Priority:** P2
- **Description:** Previous GTM IDs in planning text are stale.
- **Evidence:** `GTM-WZ4R3PQL`/`GTM-PGTJ3FJ` fail runtime probes; active web ID is `GTM-5TWMJQFP`.
- **Consequence:** Agents can inspect or mutate the wrong container.
- **Systems:** Documentation/GTM.
- **Recommended next action:** Update canonical deployment documentation after authorized server-container identification.
- **Target task:** Documentation follow-up.

## DEV-014

- **Priority:** P2
- **Description:** Data Manager historical request-ID coverage is incomplete.
- **Evidence:** The request-ID coverage query observed 3,501 Google rows with request ID and 2,594 without; a separate live provider query observed three fewer Google rows because the audit did not hold one repeatable-read snapshot.
- **Consequence:** Older accepted rows cannot receive per-request diagnostics.
- **Systems:** Google status reconciliation.
- **Recommended next action:** Classify pre-request-ID history as historical terminal/unknown; do not synthesize IDs.
- **Target task:** Operational data policy.

## DEV-015

- **Priority:** P2
- **Description:** Dead-letter total fell by 47 relative to the previous observation.
- **Evidence:** Prior 1,174 versus live 1,127.
- **Consequence:** Retention/deletion/admin cleanup provenance is unknown.
- **Systems:** `ops.dead_letter_events`, audit controls.
- **Recommended next action:** Reconcile audit logs/migration/admin actions.
- **Target task:** Warehouse governance.

## DEV-016

- **Priority:** P3
- **Description:** Event-specific collector wrappers are highly repetitive.
- **Evidence:** Thin `*CollectorTransport.ts` files delegate to one generic factory.
- **Consequence:** Maintenance overhead, but explicit typed endpoints improve discoverability.
- **Systems:** Browser analytics.
- **Recommended next action:** Consider generated/static definitions only after behavior and ownership are stable.
- **Target task:** Later refactor.

## DEV-017

- **Priority:** P1
- **Description:** Google Ads destination `AW-18180376403` is live in browser traffic despite the documented policy that native Google Ads conversion tags remain excluded.
- **Evidence:** Browser smoke 2026-07-20 observed `pagead2.googlesyndication.com/ccm/collect` pings carrying `tid=AW-18180376403` both pre-consent (cookieless, `npa=1`, `gcs=G100`) and post-consent (`gcs=G111`). No `AW-` tag exists in the published web GTM payload, so the destination is most plausibly configured on the `GT-MKRLF5WK` Google tag.
- **Consequence:** Potential double-counting risk against GA4-imported conversions — the exact risk the exclusion policy exists to prevent — and an undocumented active ad destination.
- **Systems:** Google tag configuration, Google Ads, consent surface.
- **Recommended next action:** Identify where `AW-18180376403` is configured (Google tag settings in GTM or Google Ads-side linking), verify whether conversion actions are attached, and reconcile with the GA4-import conversion policy before any change.
- **Target task:** Oppgave 1 prerequisite.

## DEV-018

- **Priority:** P1
- **Description:** A concurrent branch replays Meta purchases through backfill ledger rows with **new** event IDs.
- **Evidence:** Ledger rows `backfill:meta-purchase-replay:shopify_order...` are paired with browser `purchase:<uuid>` rows sharing `occurred_at` but carrying different `event_id` values. The script `scripts/ops/force-resend-meta-purchases-jul19.ts` exists only on branch `fix/meta-fbc-durable-click-ids` (c6c88efaf). Three Meta attempts from the backfill are `accepted_unverified`.
- **Consequence:** Meta dedupe requires identical event name **and** event ID; a replay with a new event ID cannot deduplicate against the original browser Purchase and can double-count revenue in Meta.
- **Systems:** `event_ledger`, Meta adapters, concurrent branch work.
- **Recommended next action:** Coordinate with the owner of `fix/meta-fbc-durable-click-ids`; any replay must reuse the original `event_id` or be explicitly accepted as incremental. Do not merge the branch before this is resolved.
- **Target task:** Oppgave 1 design gate.

## DEV-019

- **Priority:** P2
- **Description:** Meta Pixel logs `Invalid parameter format for currency` in production.
- **Evidence:** Browser console warning during smoke on the product page 2026-07-20; the pixel's ViewContent payload appears to carry a malformed `currency` value.
- **Consequence:** Meta may drop or degrade value/currency on affected browser events, reducing value-based optimization quality.
- **Systems:** Browser Meta tag/dataLayer contract.
- **Recommended next action:** Inspect the GTM Meta tag's currency variable mapping against the dataLayer contract; currency must be a three-letter ISO 4217 string.
- **Target task:** Oppgave 1.

## DEV-020

- **Priority:** P1
- **Description:** Meta browser/server deduplication is **not proven** and Events Manager reports ViewContent dedupe as not set up.
- **Evidence (2026-07-20):** Events Manager Deduplication for `1092362672918571` — ViewContent: «Deduplication has not been set up» / improve event ID coverage; PageView, AddToCart, InitiateCheckout: «Still Parsing Your Data». Graph `dataset_quality` omits `dedupe_key_feedback` (docs `dedup_key_feedback` is a nonexisting field). Test Events (`TEST46149`) showed separate browser and server ViewContent rows with different `event_id`s and products — channel reach only, not shared-ID dedupe. Probe: `.agent-artifacts/analytics/meta-dedupe-field-probe-2026-07-20.json`.
- **Consequence:** Risk of double-counting or weak event coverage for redundant Pixel + CAPI ViewContent until Overlap/`event_id` parity is proven in Events Manager.
- **Systems:** Browser Meta Pixel (GTM), Meta CAPI adapters, Events Manager Dataset Quality.
- **Recommended next action:** Deferred remediation — prove one live product-view with identical Pixel `eventID` and CAPI `event_id`, then re-check Deduplication Overlap. Do not block Oppgave 1 or UET CAPI on a Test Events script.
- **Target task:** Separate Meta dedupe remediation after Oppgave 1.

## Previously requested hypotheses

| Hypothesis | Verdict |
|---|---|
| Generic store in page-view-named file | Confirmed |
| Global outbox dispatch from request path | Confirmed |
| Common `accepted_unverified` | Confirmed |
| Google permanent-error history | Confirmed and currently resolved/classified |
| Meta destination mismatch | Refuted for the browser side (payload/source/dataset agree and receive); server GTM half still blocked |
| Mixed event naming | Confirmed in warehouse history; refuted for the live 7-day Meta provider window (PascalCase only) |
| Open Data Manager PR | Confirmed open; superseded/conflicting |
| Missing shop-scoped subscriptions prove missing webhooks | Refuted as a valid inference; app-scoped list now verified empty for this app token, delivery path unresolved |
