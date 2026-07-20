# Analytics evidence register

**Controlled date:** 2026-07-20.

| ID | Claim | Status | Source | Reference |
|---|---|---|---|---|
| REP-001 | Default branch and production commit are `main` / `16296b58...` | Verified | Git + Vercel | Git remote; deployment `dpl_8mmJZonfNHBXc3ugyLyHYxrULRrv` |
| REP-002 | PR 44 remains open but is functionally superseded | Verified | GitHub + source | PR 44; `googleDataManagerSharedMapping.ts:13,197-229`; `processProviderOutboxAttempt.ts:61-76,111-129` |
| EVT-001 | Catalog declares lifecycle, owner, trigger, dedupe, consent and providers | Verified | Repository | `src/lib/analytics/eventCatalog.ts:1-120,1092-1966` |
| EVT-002 | 29 events are catalogued; 25 active and four source-blocked | Verified | Repository extraction | `eventCatalog.ts`; `pnpm exec tsx` read-only extraction |
| EVT-003 | Implemented events are validated by a Zod discriminated union | Verified | Repository | `src/lib/analytics/canonicalEvent.ts:1-67` |
| EVT-004 | Canonical envelope is strict and requires UUID/offset datetime/Cookiebot consent | Verified | Repository | `canonicalEventEnvelope.ts:3-78` |
| COL-001 | Shared collector waits for Cookiebot and strips ineligible identity | Verified | Repository | `createCanonicalCollectorTransport.ts:107-196,199-239,310-367` |
| COL-002 | Collector retries one network/408/429/5xx failure | Verified | Repository | `createCanonicalCollectorTransport.ts:256-307` |
| COL-003 | Reporter files emit canonical events to dataLayer | Verified | Repository | `*Reporter.ts`; `emitCanonicalPageView.ts`; `sendGTMEvent` search |
| ID-001 | External ID is a marketing-gated one-year anonymous cookie | Verified | Repository | `firstPartyExternalId.ts:3-8,40-51,63-95` |
| ID-002 | Click IDs use URL/session plus a 90-day local record | Verified | Repository | `clickIdSessionStore.ts:1-14,76-99,154-190` |
| CONS-001 | Consent Mode defaults are denied and redaction/passthrough enabled | Verified | Repository + published GTM | `CookieScript.tsx:1-34`; published `GTM-5TWMJQFP` payload |
| CONS-002 | Cookiebot loader is GTM-owned | Verified | Published GTM | `uc.js`, `implementation=gtm` in CDN snapshot hash `7ee337e5...7423b` |
| DB-001 | Ledger and dispatch rows share one PostgreSQL transaction | Verified | Repository | `createCanonicalEventStore.ts:19-38`; `postgresCanonicalPageViewStore.ts:30-107` |
| DB-002 | A dispatch insert failure rolls back ledger insertion | Verified | Repository/transaction semantics | Same as DB-001; PostgreSQL transaction behavior |
| DB-003 | The page-view-named store is the generic canonical store | Verified | Repository | `postgresCanonicalPageViewStore.ts:106-110` |
| DB-004 | No parallel acceptance RPC/trigger exists | Verified | Live schema + repository | Live function/trigger inventory; no target triggers |
| DB-005 | Ledger has zero duplicate event IDs/idempotency keys | Verified | Live Supabase | 19,043 rows and 19,043 distinct keys/IDs |
| OUT-001 | Claim uses `FOR UPDATE SKIP LOCKED` and ten-minute reclaim | Verified | Repository | `postgresProviderOutboxStore.ts:53-98` |
| OUT-002 | Generic retry uses adapter policy and positive jitter | Verified | Repository | `processProviderOutboxAttempt.ts:18-76,79-140` |
| OUT-003 | Dead-letter row and attempt transition are one SQL statement | Verified | Repository | `postgresProviderOutboxStore.ts:136-204` |
| OUT-004 | Browser success schedules `runBatch({maxItems:1})` | Verified | Repository | `createBrowserEventRouteHandler.ts:1-29`; event route files |
| OUT-005 | That batch invokes all 32 registered workers in parallel | Verified | Repository | `runRegisteredProviderOutboxBatch.ts:21-39`; `providerOutboxWorkerRegistry.ts:37-137` |
| OUT-006 | Claim index does not include event name | Verified | Live schema/EXPLAIN | Supabase `pg_indexes`; safe EXPLAIN |
| STAT-001 | Generic adapter receipt becomes `accepted_unverified` | Verified | Repository | `runProviderOutboxWorker.ts:45-58`; `postgresProviderOutboxStore.ts:100-118,253-264` |
| STAT-002 | Google has per-request reconciliation to success/failure | Verified | Repository | `reconcileGoogleDataManagerStatusAttempt.ts:24-60`; `postgresGoogleDataManagerStatusStore.ts:54-199,269-300` |
| STAT-003 | Meta has no equivalent reconciliation worker | Verified | Repository registry/search | Provider/status registries |
| SUP-001 | Canonical warehouse is `hkoawfbomhnzupcsdggb` | Verified | Live Supabase + linked files | `supabase/.temp/project-ref`; live server |
| SUP-002 | Counts are 19,043 ledger / 21,588 attempts / 1,127 dead letters | Verified | Live Supabase | Read-only count snapshot |
| SUP-003 | Queue has no pending, processing, retry or dead-lettered rows | Verified | Live Supabase | Read-only status distribution |
| SUP-004 | All 1,127 dead letters are resolved | Verified | Live Supabase | `resolved_at` aggregate |
| SUP-005 | Prior dead-letter count exceeds current by 47 | Observed | Prior observation + live count | Reason not established |
| SUP-006 | Historical Google errors include 635 permanent and 340 missing-client rows | Verified | Live Supabase | Read-only reason/source aggregates |
| SUP-007 | Consent snapshots stop after 2026-07-15 | Verified | Live Supabase | Read-only max date/source aggregate |
| NAME-001 | Canonical and legacy/provider event names coexist | Verified | Live Supabase | Ledger event-name distribution |
| NAME-002 | Historical PascalCase rows are not claimable by canonical workers | Verified | Repository + data | Claim `event_name=$2`; registry uses canonical names |
| GTM-001 | Active web container is `GTM-5TWMJQFP` | Verified | Runtime + source | CDN 200, `/__gtg` 200, `layout.tsx` |
| GTM-002 | `GTM-WZ4R3PQL` is not the active web container | Refuted prior claim | Runtime + source | CDN/proxy 404; only planning reference |
| GTM-003 | `GTM-PGTJ3FJ` is not a resolvable active server ID | Refuted prior claim | Runtime + source | CDN 404/sGTM 400; only planning reference |
| GTM-004 | Exact server container/version/config is unavailable | Blocked | GTM Admin MCP | Permission denied |
| GTM-005 | `/__sgtm` is healthy and no-store | Verified | Runtime | HTTP 200, no-store, cache MISS |
| GA-001 | GA4 `G-FCES3L0M9M` is in the published container | Verified | Published GTM | CDN payload |
| GA-002 | No direct application Measurement Protocol transport exists | Verified | Repository search | No runtime `mp/collect`/`api_secret`; `DEPLOYMENT.md:148` |
| GA-003 | Google tag traffic still uses `/g/collect` through sGTM | Verified | Runtime/config | sGTM config and endpoint observations |
| GDM-001 | Google mapping caps identifiers at ten | Verified | Repository | `googleDataManagerSharedMapping.ts:13,197-229` |
| GDM-002 | Google request IDs and validation are persisted | Verified | Repository + live data | Outbox store/adapter receipt; coverage query observed 3,501 request IDs in 6,095 rows; separate provider snapshot had 6,092 rows |
| GDM-003 | Production Data Manager is validate-only | Observed | Vercel env name/config + runtime audit | Value observed during authorized local/runtime inspection; not reproduced |
| GDM-004 | Status lookup lacks a request-ID index | Verified | Live schema/EXPLAIN | `pg_indexes`; safe EXPLAIN |
| META-001 | Published Meta destination is `1092362672918571` | Verified | Published GTM + source/config | CDN payload |
| META-002 | Server mappers use canonical event ID | Verified | Repository | Meta mapping `.setEventId(event.event_id)` |
| META-003 | Events Manager activity, EMQ and paused gateway tag are unknown | Blocked | Meta/GTM MCP | Required read-only access unavailable |
| MS-001 | Published UET tag is `97247724` | Verified | Published GTM | CDN payload |
| MS-002 | No Microsoft server worker exists | Verified | Repository + live data | Worker registry; 222 skipped rows |
| SHOP-001 | Shopify HMAC verification is fail-closed over raw body | Verified | Repository | `verifyWebhook.ts`; webhook handlers |
| SHOP-002 | Purchase/refund event IDs are deterministic | Verified | Repository | `shopifyOrderToCanonicalPurchase.ts`; `shopifyRefundToCanonicalRefund.ts` |
| SHOP-003 | App-scoped subscriptions/delivery logs are not proven | Blocked | Shopify Admin MCP/plugin | Tool not available/authorized |
| VER-001 | Both main tracking crons run every five minutes | Verified | Vercel config/logs | `vercel.json`; 36 executions/3h each |
| VER-002 | Recent tracking persistence has `EMAXCONNSESSION` errors | Verified | Vercel runtime errors | consent/web-vitals routes |
| TEST-001 | Frozen install and production build pass | Verified | Local command | Exit 0 |
| TEST-002 | Lint/initial typecheck/direct Node test commands have baseline failures | Verified | Local command | See `current-state.md` validation table |
| TEST-003 | Post-typegen typecheck and targeted analytics tests pass | Verified | Local command | Typecheck exit 0; 265/265 targeted tests |

## External documentation evidence

| ID | Supported assessment | Official source |
|---|---|---|
| DOC-001 | Data Manager ingest is the current server event endpoint | <https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest> |
| DOC-002 | GA4 MP endpoint/limits and absence of event dedupe contract | <https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events> |
| DOC-003 | Meta dedupe requires matching event name and ID | <https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events> |
| DOC-004 | Meta website server-event identifier requirements | <https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event> |
| DOC-005 | UET is prerequisite for Microsoft conversion tracking | <https://learn.microsoft.com/en-us/advertising/guides/universal-event-tracking?view=bingads-13> |
| DOC-006 | Shopify raw-body HMAC and webhook-ID dedupe | <https://shopify.dev/docs/apps/build/webhooks/verify-deliveries> |
| DOC-007 | Next `after` is post-response work bounded by platform duration | <https://nextjs.org/docs/app/api-reference/functions/after> |
| DOC-008 | Vercel crons call production GET endpoints in UTC | <https://vercel.com/docs/cron-jobs> |
| DOC-009 | `SKIP LOCKED` is suitable for queue-like consumers | <https://www.postgresql.org/docs/current/sql-select.html> |
