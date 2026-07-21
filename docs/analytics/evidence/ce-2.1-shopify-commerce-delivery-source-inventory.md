# CE-2.1 — Shopify commerce delivery source inventory

```text
Charter-version: 1.0.0
Roadmap: CE-2.1
Affected invariants: INV-002, INV-003, INV-010, INV-014, INV-018, INV-019, INV-020, INV-021
Goal: prove every live or latent source that can create canonical purchase or refund events
Non-goals: register webhooks, change code/config/env/schema, send events, replay, push/deploy
Primary role: canonical-event-evidence-auditor
Purchase conclusion: MULTIPLE_SOURCES
Refund conclusion: NO_SOURCE
Program verdict: STOP_ACTIVE_DOUBLE_COUNT_RISK
```

## Governance snapshot

| Field                                | Value                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Owner authorization                  | Phase 1 ACCEPTED; CE-2.1 authorized 2026-07-21                                        |
| Worktree                             | `.worktrees/ce-2.1-shopify-sources`                                                   |
| Evidence lineage HEAD                | `3dc697792da8bb360c98a2cecf6b33ca98206da2` (MATCH before write)                       |
| Production deploy (context)          | `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` @ `0a800b1ae169eab8af12c21b3595fe99a667d54c` READY |
| Rollback SHA                         | `ee781aed52474eb6bdecee63e43ffabec9d0cea2`                                            |
| Audit timezone                       | Europe/Oslo (CEST, UTC+2)                                                             |
| Audit window                         | ≥7d runtime/logs; ledger lifetime aggregates for purchase/refund                      |
| Mutations performed                  | evidence file write/commit only                                                       |
| Secrets / HMAC / PII / full payloads | none retained                                                                         |

### Starting claims — reverified (not assumed)

| Starting claim                                                       | Reverify result                                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2026-07-20: zero shop-specific subscriptions for inspected app/token | **CONFIRMED** 2026-07-21 — GraphQL `webhookSubscriptions` pages = 0; REST `webhooks.json` = 0 |
| 2026-07-21: canonical purchase from webhook/server/ops_backfill      | **CONFIRMED** — `purchase` rows: webhook=12, server=3, ops_backfill=3                         |
| 2026-07-21: no canonical refund rows                                 | **CONFIRMED** — `lower(event_name)='refund'` count = 0                                        |

---

## Claim register

### Claim A — Repository purchase/refund ingest surfaces

```text
Claim: Repository exposes accept-only Shopify webhook routes for purchase/refund; no browser /api/events/purchase or /api/events/refund route; ops scripts can insert purchase rows.
Status: VERIFIED
Timestamp and environment: 2026-07-21T09:11+02:00; worktree HEAD 3dc697792
Source/tool/account identifier: repository read; rg; file inventory
Exact source path/query/request: listed files below
Sanitized result: see §1
Limitation: route existence ≠ production delivery ownership
Roadmap/deviation impact: evidence update for SAFE-002 / DEV-008; feeds CE-2.2 owner decision
```

### Claim B — Shop-specific Shopify subscriptions empty

```text
Claim: Production token for Utekos Storefront has zero shop-specific webhookSubscriptions and zero REST webhooks, including ORDERS_PAID / REFUNDS_CREATE.
Status: VERIFIED
Timestamp and environment: 2026-07-21T09:12+02:00; Admin API 2025-07; shop erling-7921.myshopify.com
Source/tool/account identifier: Shopify Admin GraphQL + REST with SHOPIFY_ADMIN_API_TOKEN (app Utekos Storefront gid://shopify/App/301600669697)
Exact source path/query/request: CanonicalWebhookSubscriptions(first:50) paginated; GET webhooks.json?limit=250
Sanitized result: subscription_count=0; rest_webhook_count=0
Limitation: app-specific (toml/Partner-config) subscriptions do not appear in this query
Roadmap/deviation impact: reconfirms SHOP-003; does not prove absence of deliveries
```

### Claim C — Live orders-paid HTTP deliveries exist despite empty shop-specific list

```text
Claim: Production Vercel received POST /api/shopify/webhooks/orders-paid with 202/200 in the last 7 days across multiple main deployments; refunds-create had zero matching logs.
Status: VERIFIED (path traffic); UNKNOWN (Shopify subscription method / owning app config)
Timestamp and environment: 2026-07-14 → 2026-07-21 UTC; Vercel project prj_MpZN3Z0PDp8rfwpdzAeplGe4Di0s
Source/tool/account identifier: plugin-vercel get_runtime_logs; team_0B8gWWIxT2hGVIJnK8CwanAi
Exact source path/query/request: query=orders-paid / /api/shopify/webhooks/orders-paid; since=7d; group_by statusCode|deploymentId|requestPath
Sanitized result: orders-paid path count=14 (202×12, 200×2); refunds-create empty; no legacy /api/webhooks/* path hits observed in successful aggregates
Limitation: Shopify delivery-log fields (X-Shopify-Webhook-Id / Event-Id / subscription method) not exposed in Vercel log summaries; Partner delivery UI not queried
Roadmap/deviation impact: refutes “no webhook traffic”; owner of subscription remains SAFE-002 / CE-2.3A input
```

### Claim D — Canonical ledger purchase sources are multiple; refund absent

```text
Claim: marketing.event_ledger contains canonical purchase from webhook, server, and ops_backfill; no canonical refund; three shopify_order_* transaction_ids appear under both webhook and server with distinct event_ids.
Status: VERIFIED
Timestamp and environment: 2026-07-21T09:14+02:00; Supabase pink-lens hkoawfbomhnzupcsdggb via SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
Source/tool/account identifier: read-only SQL (postgres.js)
Exact source path/query/request: aggregates in §4
Sanitized result: purchase webhook=12 / server=3 / ops_backfill=3; refund=0; 3 txn overlaps webhook∩server
Limitation: plugin-supabase MCP execute_sql denied (Atlas-scoped); used direct warehouse URL instead
Roadmap/deviation impact: DEV-018 active; program STOP_ACTIVE_DOUBLE_COUNT_RISK
```

### Claim E — Browser GTM published triggers do not fire purchase; GA volume still exceeds ledger

```text
Claim: Published web GTM (GTM-5TWMJQFP v121) ecommerce + Meta browser triggers exclude purchase/Purchase; GA4 property 489598217 still reports 36 purchase events in 7d vs 18 canonical purchase ledger creates in 7d.
Status: OBSERVED
Timestamp and environment: GTM artifact 2026-07-20; GA run_report 2026-07-21; ledger created_at last 7d
Source/tool/account identifier: .agent-artifacts/analytics/gtm-readonly-inventory-2026-07-20.json; Google Analytics MCP run_report properties/489598217
Exact source path/query/request: publishedVersion triggers 146/152; run_report eventName=purchase metrics eventCount/ecommercePurchases
Sanitized result: trigger regex excludes purchase; GA purchase eventCount=36; ledger 7d creates=18
Limitation: GA cannot identify transport (sGTM / Data Manager / other); Meta EMQ artifact unusable (build error JSON)
Roadmap/deviation impact: corroboration only; not authoritative Shopify owner
```

---

## 1. Repository inventory and classification

### 1.1 Required handlers (current at HEAD `3dc697792`)

| Path                                                                               | Role                                                           | Creates ledger row? | Classification                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------- | ---------------------------------------------- |
| `src/app/api/shopify/webhooks/orders-paid/route.ts`                                | POST → handler                                                 | via accept          | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts`                       | HMAC verify → map → `acceptCanonicalPurchase`                  | yes                 | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/server/shopifyOrderToCanonicalPurchase.ts`                      | `source:'webhook'`; `deterministicPurchaseEventId(order.id)`   | mapper              | AUTHORITATIVE_CANDIDATE                        |
| `src/app/api/shopify/webhooks/refunds-create/route.ts`                             | POST → handler                                                 | via accept          | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts`                    | HMAC verify → map → `acceptCanonicalRefund`                    | yes                 | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/server/shopifyRefundToCanonicalRefund.ts`                       | `source:'webhook'`; `deterministicRefundEventId(refund.id)`    | mapper              | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/purchaseEvent.ts` / `refundEvent.ts`                            | schemas; `source` enum `webhook\|server`                       | contract            | —                                              |
| `src/lib/analytics/server/acceptCanonicalPurchase.ts` / `acceptCanonicalRefund.ts` | normalize + plan outbox + store.accept                         | yes                 | AUTHORITATIVE_CANDIDATE                        |
| `src/lib/analytics/server/getVerifiedShopifyCustomerContext.ts`                    | request context for purchase                                   | supporting          | —                                              |
| `src/lib/analytics/checkoutAttributionSnapshot.ts` / `checkoutConsentSnapshot.ts`  | note-attribute consent/attribution                             | supporting          | RECONCILIATION_SOURCE (lookup)                 |
| `src/app/api/events/*`                                                             | 23 browser collectors; **no purchase/refund routes**           | n/a                 | LEGACY_OR_DEAD for ledger purchase/refund      |
| `scripts/ops/force-resend-meta-purchases-jul19.ts`                                 | inserts new purchase rows `source:'server'` with new event_ids | yes                 | BACKFILL_OR_REPLAY                             |
| `scripts/ops/backfill-july16-google-data-manager-purchases.ts`                     | server/backfill purchase path for Google                       | yes / updates       | BACKFILL_OR_REPLAY                             |
| `scripts/generate-phase2-canonical-events.mjs`                                     | generator with `source:'server'`                               | latent              | BACKFILL_OR_REPLAY                             |
| Provider adapters (`dispatchCanonicalPurchaseTo*`)                                 | outbox → Meta/Google/Microsoft                                 | provider only       | PROVIDER_DERIVATION_ONLY                       |
| `shopify.app.toml`                                                                 | not present in repository                                      | —                   | UNKNOWN (app-specific config absent from repo) |
| Legacy `/api/webhooks/orders-paid`                                                 | directory absent                                               | —                   | LEGACY_OR_DEAD                                 |

Event-ID derivation (code):

- purchase:
  `sha256("utekos:purchase:{shopifyOrderLegacyId}:paid")` → UUID
- refund: `sha256("utekos:refund:{refundId}:created")` → UUID
- transaction*id purchase: `shopify_order*{legacyId}`
- refund*id: `shopify_refund*{legacyId}`

Consent/attribution for webhook purchase: checkout note
attributes via `parseOrderAttributionFromNoteAttributes`;
marketing-gated click IDs / location. Refund mapper uses denied
consent snapshot.

### 1.2 Search hits (classification summary)

| Pattern                                 | Finding                                                                                     | Classification                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| orders-paid / refunds-create routes     | present under `/api/shopify/webhooks/*`                                                     | AUTHORITATIVE_CANDIDATE                       |
| webhookSubscriptions / shopify.app.toml | no toml; no registration script on this HEAD                                                | UNKNOWN for app-specific                      |
| ops_backfill                            | **not** written by current TS schemas (enum webhook\|server) but **present in live ledger** | BACKFILL_OR_REPLAY / UNKNOWN producer in repo |
| browser purchase route                  | absent                                                                                      | LEGACY_OR_DEAD                                |
| PascalCase `Purchase`                   | historical ledger rows only                                                                 | LEGACY_OR_DEAD                                |

---

## 2. Shopify inventory

### 2.1 App installation (token-scoped)

| Field                                         | Sanitized value                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Shop                                          | `erling-7921.myshopify.com`                                            |
| App title                                     | Utekos Storefront                                                      |
| App ID                                        | `gid://shopify/App/301600669697`                                       |
| API version used                              | `2025-07`                                                              |
| Access scopes                                 | 152 scopes (includes `read_all_orders`, `read_customers`, …)           |
| Released app version / Partner webhook config | **UNKNOWN** — no `shopify.app.toml`; Partner UI not read in this audit |
| App-specific subscriptions                    | **UNKNOWN** (not visible via Admin `webhookSubscriptions`)             |

### 2.2 Shop-specific subscriptions

Paginated GraphQL `webhookSubscriptions(first:50)` → **0
nodes**.
REST `webhooks.json?limit=250` → **0 webhooks**.

Relevant topics `ORDERS_PAID` / `REFUNDS_CREATE`: **none
listed**.

### 2.3 Delivery evidence (≥7d)

Shopify Partner/Admin delivery log UI was **not** available to
this auditor. Delivery evidence is therefore taken from Vercel
HTTP logs + ledger correlation.

| Observation                                    | Result                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Destination path                               | `/api/shopify/webhooks/orders-paid` only                                                                            |
| HTTP statuses (7d)                             | 202×12, 200×2 (accepted / duplicate-style)                                                                          |
| 401 / 400 / 500                                | **0** in filtered aggregates                                                                                        |
| refunds-create                                 | **0** requests in 7d filter                                                                                         |
| Sample function logs                           | `[purchase-outbox-after] started/completed` on older deploys (pre–cron-only isolation behavior visible in log text) |
| Subscription method / subscription ID          | **UNKNOWN**                                                                                                         |
| X-Shopify-Webhook-Id / Event-Id / Triggered-At | **not present** in Vercel MCP log summaries                                                                         |
| Ledger correlation                             | webhook `purchase` rows created through 2026-07-21T00:36:12Z                                                        |

Deployments that served orders-paid in 7d (counts):
`dpl_8mmJZonf…`×3, `dpl_2QFySg9x…`×3, `dpl_Ft3wSZfu…`×2, plus
single hits on several other main deploys including
`dpl_9AFed1ZS…` (`ed16dfd06…`) and `dpl_54ubTSu6…`
(`ee781aed5…`).
Current production `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`
(`0a800b1ae…`): **no** orders-paid rows in the 24h
deployment-scoped sample (no new paid orders observed on that
deploy yet).

---

## 3. Vercel inventory

| Path                                   | 7d evidence               | Notes                     |
| -------------------------------------- | ------------------------- | ------------------------- |
| `/api/shopify/webhooks/orders-paid`    | 14 requests; 202/200 only | Live                      |
| `/api/shopify/webhooks/refunds-create` | 0                         | No live delivery          |
| `/api/webhooks/orders-paid`            | not observed              | legacy absent in app tree |
| `/api/webhooks/refunds-create`         | not observed              | legacy absent             |

Project: `prj_MpZN3Z0PDp8rfwpdzAeplGe4Di0s` / team
`team_0B8gWWIxT2hGVIJnK8CwanAi`.
30d group_by queries timed out / 400 for some broad filters; 7d
path evidence is sufficient for CE-2.1.

Do **not** infer Shopify ownership from route existence alone —
but HTTP 202 with ledger webhook rows proves **some** sender
delivers signed payloads that pass HMAC.

---

## 4. Supabase inventory (PII-free)

Warehouse: `hkoawfbomhnzupcsdggb` (direct URL). Columns on
`marketing.event_ledger`:
`id, event_id, event_name, idempotency_key, anonymous_id, external_id, source_url, consent, user_data_quality, payload, occurred_at, created_at`.

### 4.1 Ledger by event_name × payload.source

| event_name      | source       | n     | distinct event_id | occurred_at span        | created_at span                  |
| --------------- | ------------ | ----- | ----------------- | ----------------------- | -------------------------------- |
| purchase        | webhook      | 12    | 12                | 2026-07-17 → 2026-07-21 | 2026-07-17 → 2026-07-21          |
| purchase        | server       | 3     | 3                 | 2026-07-19              | created 2026-07-20 (meta replay) |
| purchase        | ops_backfill | 3     | 3                 | 2026-07-16              | created 2026-07-17               |
| Purchase        | shopify      | 45    | 45                | 2026-06-14 → 2026-07-14 | legacy PascalCase                |
| Purchase        | null         | 14    | 14                | 2026-06-08 → 2026-06-14 | legacy                           |
| refund / Refund | —            | **0** | —                 | —                       | —                                |

Last 7d creates (`created_at`): webhook 12, server 3,
ops_backfill 3.

### 4.2 Idempotency / duplicates

- Duplicate `(event_name, event_id)` on purchase/refund: **none**
- Shared `event_id` across sources: **none**
- Idempotency shapes for canonical purchase: `purchase:{uuid}`
  ×12; `backfill:*` ×6 (ops_backfill + meta-purchase-replay)

### 4.3 Same-order multi-source (active double-count risk)

Three `transaction_id` values appear under **both** `webhook` and
`server` with **different** `event_id`s:

| transaction_id              | webhook event_id prefix | server event_id prefix | server idempotency prefix       |
| --------------------------- | ----------------------- | ---------------------- | ------------------------------- |
| shopify_order_6965934915832 | bc0ac046…               | 702d50a0…              | backfill:meta-purchase-replay:… |
| shopify_order_6965958508792 | 0104479e…               | d4bba573…              | backfill:meta-purchase-replay:… |
| shopify_order_6966299459832 | fab0edbc…               | fb161900…              | backfill:meta-purchase-replay:… |

Server rows match
`scripts/ops/force-resend-meta-purchases-jul19.ts` (DEV-018 /
SAFE-001).

ops*backfill rows use non-UUID `event_id` =
`shopify_order*{legacyId}`and idempotency`backfill:purchase:{legacyId}`— producer **not** found as`ops_backfill`string in current repo scripts (scripts emit`source:'server'`).
Treat producer as **UNKNOWN** historical/backfill path still
represented in ledger.

### 4.4 Provider attempts

Canonical `purchase` attempts exist for google / meta /
microsoft_uet (statuses include succeeded, accepted_unverified,
skipped_unqualified).
`purchase` without any provider attempt: **1** webhook row.
Duplicate provider idempotency keys in the naive group-by are
**cross-provider** (same `purchase:{event_id}` key reused across
google+meta[+microsoft_uet]), not duplicate same-provider rows.

No `refund` provider attempts.

### 4.5 Checkout attribution linkage

`marketing.checkout_attribution_snapshots`: 9 rows (captured_at
2026-07-08 → 2026-07-14).
Join by `browser_id` ↔ `primary_storage_token` /
`storage_tokens`: **0** matches for current canonical purchase
sources.
Snapshots predate the 2026-07-17+ webhook purchase window —
linkage for recent webhook purchases is **not proven** via this
table.

### 4.6 Dead letters

Hits involving shopify URL params / google tracking / meta
validation are historical and **resolved** (`unresolved=0` in
sampled groups). No open Shopify purchase/refund dead-letter
cluster identified as blocking CE-2.1 inventory.

---

## 5. GTM / GA / Meta corroboration

| Question                                                          | Answer                                                                                                                                 | Evidence                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Does a browser purchase source still fire into GTM web container? | **No** for published triggers 146/152                                                                                                  | Regex excludes `purchase` / `Purchase`     |
| Browser Meta pixel purchase?                                      | **No** in tag 153 EVENT_NAMES map                                                                                                      | page_view…generate_lead only               |
| Event name / ID for browser commerce?                             | GA4 tag 118 maps `event_id` from dataLayer for non-purchase ecommerce events                                                           | published v121                             |
| Can browser + webhook represent same order in ledger?             | Browser **cannot** create canonical purchase ledger rows (no route); provider-side browser Meta may still exist outside this container | repo + GTM                                 |
| Meta browser/server overlap for Purchase?                         | **Not proven** this audit (EMQ artifact broken; prior DEV-020 open)                                                                    | limitation                                 |
| GA purchase volume vs ledger?                                     | GA4 `properties/489598217` 7d: eventCount/ecommercePurchases=**36**; ledger 7d creates=**18**                                          | unreconciled gap — not Shopify owner proof |

---

## 6. Source matrices

### 6.1 purchase

| Source                          | Trigger                            | Event-ID derivation                    | Consent/attribution source           | Live evidence                           | Can create ledger row     | Candidate role                            |
| ------------------------------- | ---------------------------------- | -------------------------------------- | ------------------------------------ | --------------------------------------- | ------------------------- | ----------------------------------------- |
| Shopify app-specific webhook    | ORDERS_PAID → HTTPS callback       | deterministic from order legacy id     | note attributes / checkout snapshots | deliveries exist; **config UNKNOWN**    | yes (via webhook handler) | AUTHORITATIVE_CANDIDATE / UNKNOWN owner   |
| Shopify shop-specific webhook   | Admin webhookSubscriptions         | same                                   | same                                 | **absent** (0 subs)                     | would, if created         | LEGACY_OR_DEAD / not live                 |
| Browser purchase route/reporter | `/api/events/purchase`             | n/a                                    | n/a                                  | route **absent**; GTM excludes purchase | **no** (current code)     | LEGACY_OR_DEAD                            |
| Server purchase path            | ops force-resend / generators      | **new UUID** (replay) or deterministic | copied/mutated payload               | 3 `source=server` rows                  | yes                       | BACKFILL_OR_REPLAY / COMPATIBILITY_SOURCE |
| Reconciliation query/job        | not implemented as live cron owner | —                                      | —                                    | none                                    | no                        | UNKNOWN / future CE-2.3B                  |
| Ops backfill/replay             | historical backfill                | `shopify_order_*` or replay UUID       | varies                               | 3 `ops_backfill` + 3 server replay      | yes                       | BACKFILL_OR_REPLAY                        |
| Legacy PascalCase ingestion     | historical `Purchase`              | shopify_order / null source            | legacy                               | 59 historical rows; no new canonical    | historical only           | LEGACY_OR_DEAD                            |
| Manual/provider-side events     | Meta/GA/sGTM outside ledger        | provider-native                        | provider                             | GA 36 vs ledger 18                      | no (ledger)               | PROVIDER_DERIVATION_ONLY                  |

### 6.2 refund

| Source                        | Trigger            | Event-ID derivation          | Consent/attribution source | Live evidence                          | Can create ledger row | Candidate role                   |
| ----------------------------- | ------------------ | ---------------------------- | -------------------------- | -------------------------------------- | --------------------- | -------------------------------- |
| Shopify app-specific webhook  | REFUNDS_CREATE     | deterministic from refund id | denied snapshot in mapper  | **no** HTTP traffic 7d; config UNKNOWN | yes if delivered      | AUTHORITATIVE_CANDIDATE (latent) |
| Shopify shop-specific webhook | Admin subscription | same                         | same                       | **absent**                             | would                 | not live                         |
| Browser refund route          | none               | —                            | —                          | absent                                 | no                    | LEGACY_OR_DEAD                   |
| Server / backfill refund      | none found live    | —                            | —                          | no rows                                | latent scripts only   | UNKNOWN                          |
| Reconciliation                | none live          | —                            | —                          | none                                   | no                    | UNKNOWN                          |
| Legacy PascalCase Refund      | historical         | —                            | —                          | **0** rows                             | no                    | LEGACY_OR_DEAD                   |
| Manual/provider-side          | —                  | —                            | —                          | none observed                          | no                    | PROVIDER_DERIVATION_ONLY         |

---

## 7. Conclusions

### Per-event

```text
purchase → MULTIPLE_SOURCES
refund   → NO_SOURCE
```

Rationale:

- Purchase ledger rows are created by **webhook** (live HTTP),
  **server** (meta purchase replay), and **ops_backfill**
  (historical).
- Same Shopify order can appear twice with different event_ids
  (webhook ∩ server) → provider double-count risk is **active**,
  not theoretical.
- Refund route/mapper exist, but **zero** shop-specific
  subscriptions, **zero** Vercel traffic, **zero** ledger rows →
  no live source.

### Program verdict

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

### Blockers for CE-2.2 readiness

1. **Active double-count:** freeze/stop `force-resend` / any
   backfill that mints new purchase `event_id`s for orders
   already accepted as webhook (evidence: three `shopify_order_*`
   overlaps). Needed: owner policy + replay contract (CE-2.6 /
   SAFE-001).
2. **Webhook subscription owner unknown:** shop-specific list
   empty while orders-paid delivers. Needed: Partner/app-released
   webhook config or delivery-log proof of subscription method /
   app (CE-2.3A input; closes SAFE-002).
3. **Refund has no live source:** decide whether absence is
   acceptable until CE-2.3A or requires reconciliation (CE-2.2 /
   CE-2.5).
4. **GA purchase volume ≠ ledger:** 36 vs 18 in 7d — classify
   non-ledger purchase transport before treating GA as commerce
   truth.

Non-blocking observations:

- Current Phase-1 deploy not yet exercised by a new orders-paid
  event in the sampled window.
- Checkout attribution snapshots not linked to recent webhook
  purchases by browser_id.
- `ops_backfill` producer string absent from current repo
  scripts.

### Stop conditions honored

No webhook registration, no schema/env/provider writes, no
push/deploy, no HMAC/PII/payload dumps.

---

## 8. Documentation status

Dokumentasjonsstatus: **sufficient to inventory CE-2.1** with
explicit UNKNOWN gaps (app-specific Shopify config; Shopify
delivery-log headers; Meta EMQ).
Primary evidence used: live Shopify Admin API, Vercel runtime
logs, Supabase aggregates, repository HEAD `3dc697792`, GTM
inventory artifact 2026-07-20, GA Data API.
Does **not** authorize CE-2.2 implementation or webhook
registration.
