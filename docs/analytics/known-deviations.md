# Known deviations

## DEV-001

- **Priority:** P0
- **Description:** Every accepted browser event and transaction webhook schedules a full provider registry drain.
- **Evidence:** `createBrowserEventRouteHandler.ts:16-29`; `runRegisteredProviderOutboxBatch.ts:21-39`; 32 entries in `providerOutboxWorkerRegistry.ts`.
- **Consequence:** One request can claim unrelated backlog, execute 32 empty/active claims, compete with cron and move queue drainage into the request deployment lifecycle.
- **Systems:** All `/api/events/*`, purchase/refund webhooks, Vercel functions, Supabase outbox.
- **Recommended next action:** Make request-path dispatch targeted to the attempt IDs created by that transaction, or remove immediate dispatch and rely on cron.
- **Target task:** Oppgave 1, first code change.

## DEV-002

- **Priority:** P0
- **Description:** Meta destination/tag state is not fully reconciled across web GTM, server GTM and Events Manager.
- **Evidence:** Current web payload/source agree on `1092362672918571`, but Meta Events Manager and GTM server Admin are blocked; paused CAPI Gateway claim remains unknown.
- **Consequence:** A hidden server destination mismatch or paused tag could cause loss or non-deduplicated duplication.
- **Systems:** Web GTM, server GTM, Meta Events Manager, Meta adapters.
- **Recommended next action:** Obtain read-only Meta/GTM access and produce a three-source destination/event-name/event-ID proof before any cleanup.
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

- **Priority:** P1
- **Description:** Microsoft browser UET exists but no Microsoft server worker is registered.
- **Evidence:** Published UET `97247724`; registry has only Google/Meta; 222 Microsoft attempts are skipped.
- **Consequence:** Catalog/server expectations can be mistaken for production CAPI coverage.
- **Systems:** Microsoft UET/CAPI, catalog, outbox.
- **Recommended next action:** Keep status blocked until official CAPI contract, dedupe and credential smoke are proven.
- **Target task:** Dedicated Microsoft task.

## DEV-008

- **Priority:** P1
- **Description:** Shopify active subscriptions and delivery history are not proven.
- **Evidence:** Routes exist; no registration code/app config; Shopify Admin MCP/plugin unavailable.
- **Consequence:** Correct webhook code does not prove Shopify is delivering production events.
- **Systems:** Shopify app configuration, purchase/refund routes.
- **Recommended next action:** Read app-scoped subscriptions and delivery logs; do not infer from shop-scoped queries alone.
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

## Previously requested hypotheses

| Hypothesis | Verdict |
|---|---|
| Generic store in page-view-named file | Confirmed |
| Global outbox dispatch from request path | Confirmed |
| Common `accepted_unverified` | Confirmed |
| Google permanent-error history | Confirmed and currently resolved/classified |
| Meta destination mismatch | Not proven; current web/source ID agrees, Events Manager/server GTM blocked |
| Mixed event naming | Confirmed |
| Open Data Manager PR | Confirmed open; superseded/conflicting |
| Missing shop-scoped subscriptions prove missing webhooks | Refuted as a valid inference; app-scoped status blocked |
