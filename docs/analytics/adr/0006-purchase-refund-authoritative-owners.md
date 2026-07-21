# ADR-0006 — Authoritative Purchase and Refund owners

```text
Charter-version: 1.0.0
Roadmap task: CE-2.2 / CE-2.2A / CE-2.2B
Affected invariants: INV-001, INV-002, INV-003, INV-010, INV-014,
  INV-015, INV-017, INV-020, INV-021
Decision-log entry: DEC-010 (amended by DEC-011, DEC-012)
Status: APPROVED (CE-2.2B / DEC-012 ACCEPTED 2026-07-21;
  preconditions remain for cutover + refund schema remediation)
Date: 2026-07-21
Amended: 2026-07-21 (CE-2.2A, CE-2.2B; CE-2.3A ACCEPTED with
  payload blocker)
Primary evidence:
  docs/analytics/evidence/ce-2.1-shopify-commerce-delivery-source-inventory.md
  docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
Owner model (CE-2.2B / DEC-012):
  Shopify Admin → Settings → Notifications → Webhooks
```

## Context

CE-2.1 proved:

```text
purchase → MULTIPLE_SOURCES
  webhook / server / ops_backfill
refund   → NO_SOURCE (at inventory time)
program  → STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Admin GraphQL `webhookSubscriptions` / REST `webhooks.json` were
empty for the inspected token, while production still received
live `POST /api/shopify/webhooks/orders-paid`. That gap is
explained by Admin **notification** webhooks.

### CE-2.2B — Shopify Admin notification webhooks

Verified production destinations (owner-created; CE-2.3A
read-only verified):

```text
Order payment
  → https://utekos.no/api/shopify/webhooks/orders-paid
  → JSON
  → Webhook API version 2026-04
  → signed with shop-level notification secret
  → runtime SHOPIFY_WEBHOOK_SECRET
  → LIVE and technically verified (ledger + HMAC)

Refund create
  → https://utekos.no/api/shopify/webhooks/refunds-create
  → JSON
  → Webhook API version 2026-04
  → same SHOPIFY_WEBHOOK_SECRET
  → LIVE as subscription; canonical acceptance BLOCKED by
    repository refund payload schema vs 2026-04 sample
```

Shopify Admin-created **notification** webhook subscriptions are
shop-attached and are **not** returned by Admin API
`webhookSubscriptions`. Therefore:

- empty `webhookSubscriptions` does **not** prove absence of live
  Order payment / Refund create delivery;
- `webhookSubscriptionCreate` / `webhookSubscriptionUpdate` must
  **not** own or recreate these subscriptions;
- `shopify.app.toml` / `shopify app deploy` do **not** own them;
- HMAC verification continues via `SHOPIFY_WEBHOOK_SECRET` (shop
  notification secret), not the custom app API secret key.

### Role of custom app “Utekos Storefront”

The Admin API token for **Utekos Storefront**
(`erling-7921.myshopify.com`) is used for:

- read-only identity control;
- Shopify reconciliation (CE-2.3B+);
- other future Admin API operations when separately approved;

It does **not** own or represent the notification webhooks. The
app API secret key must **not** replace `SHOPIFY_WEBHOOK_SECRET`.

### Prior amendments

- CE-2.2 initially chose
  `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION` (toml/Partner) —
  superseded for implementation.
- CE-2.2A chose `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  (GraphQL `webhookSubscriptionCreate`) — superseded by CE-2.2B /
  DEC-012 (wrong management surface).
- CE-2.2B sets notification-webhook ownership below.

Three `payload.custom_data.transaction_id` values still appear
under both `webhook` and `server` with **distinct** `event_id`s.
`STOP_ACTIVE_DOUBLE_COUNT_RISK` remains active until purchase
cutover + replay containment.

DEC-007 remains binding: a webhook **route** is not proven
ownership until subscription, delivery, and identity are
established for each event.

## Decision

### Purchase owner model

```text
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
```

### Refund owner model

```text
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
```

### ADR conclusion

```text
APPROVED
```

### CE-2.3A status (folded into CE-2.2B)

```text
Technical conclusion:
  SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER

Governance status:
  ACCEPTED_WITH_PAYLOAD_BLOCKER

orders-paid:
  LIVE — production-proven; do not create; do not duplicate

refunds-create:
  LIVE subscription — canonical accept blocked until separate
  approved schema remediation for 2026-04 payload types

GraphQL webhookSubscriptionCreate / webhookSubscriptionUpdate
  for ORDERS_PAID / REFUNDS_CREATE:
  FORBIDDEN

Mode A (shopify.app.toml / shopify app deploy):
  NOT_APPLICABLE

Mode B (Admin API subscription create for these topics):
  FORBIDDEN under this owner model
```

### Active blockers

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
```

Refund blocker detail (schema fix is a later code task — not this
ADR amendment):

```text
Shopify refunds/create 2026-04 sample:
  subtotal may be number
  currency may be null

Current repository schema:
  subtotal required as string
  currency rejects null
```

## Alternatives considered

### `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`

Rejected / superseded — no released `shopify.app.toml` path for
this production delivery; notification webhooks are the live
surface.

### `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`

Rejected / superseded by CE-2.2B — Admin API
`webhookSubscriptions` cannot see or safely manage the live
notification webhooks; creating GraphQL subscriptions would risk
`STOP_DUPLICATE_SUBSCRIPTIONS`.

### `RECONCILIATION_ONLY`

Rejected as sole owner. Verified Shopify delivery remains
required; reconciliation covers missed deliveries only.

### `TEMPORARY_COMPATIBILITY_SOURCE_WITH_CUTOVER`

Rejected as durable owner. Server/`ops_backfill` UUID-minting
paths remain the active double-count vector until CE-2.6.

## Decision dimensions

### Authoritative trigger semantics

| Event    | Authoritative trigger                                   |
| -------- | ------------------------------------------------------- |
| purchase | Shopify Admin notification **Order payment** (live)     |
| refund   | Shopify Admin notification **Refund create** (live sub) |

One paid Shopify order → at most one canonical `purchase`. One
Shopify Refund ID → exactly one canonical `refund` (after schema
compatibility).

### Webhook subscription method

**Shopify Admin → Settings → Notifications → Webhooks** for:

- Order payment → `/api/shopify/webhooks/orders-paid` (**live**)
- Refund create → `/api/shopify/webhooks/refunds-create`
  (**live**; accept path schema-blocked)

HMAC: shop-level notification signing secret via
`SHOPIFY_WEBHOOK_SECRET` (`verifyShopifyWebhook`).

Do **not**:

- create GraphQL Admin API subscriptions for these topics;
- use `shopify.app.toml` / `shopify app deploy` as owner;
- replace `SHOPIFY_WEBHOOK_SECRET` with the app API secret key;
- invent a second destination for either event.

### Utekos Storefront Admin API token — allowed uses

```text
KEEP — read-only identity verification
KEEP — reconciliation source fetches (CE-2.3B+)
KEEP — future Admin API ops under separate approval
FORBIDDEN — representing or recreating notification webhooks
FORBIDDEN — replacing SHOPIFY_WEBHOOK_SECRET
```

### Reconciliation query/source

Unbounded requirements unchanged from CE-2.2: bounded
`updated_at` overlap, pagination, rate limits, no full unbounded
scan in normal cron, duplicate-safe overlap, reuse ledger/outbox
(INV-017), overlap-safe lease, read-only Shopify fetch then
normal canonical acceptance, explicit historical backfill path.
`KEEP_RECONCILIATION` — never a second authoritative owner.

### Canonical event-ID derivation

Unchanged:

```text
purchase event_id:
  deterministicPurchaseEventId(shopify order legacy ID)

purchase transaction_id:
  shopifyPurchaseTransactionId(shopify order legacy ID)

refund event_id:
  deterministicRefundEventId(shopify refund legacy ID)

refund refund_id:
  shopifyRefundRecordId(shopify refund legacy ID)

refund transaction_id:
  original Shopify purchase transaction ID
```

### Shopify delivery / event ID usage

- `X-Shopify-Webhook-Id` — delivery retry dedupe only.
- `X-Shopify-Event-Id` — correlation evidence only.
- Neither replaces order/refund-derived canonical IDs.

### Ledger / provider idempotency

Unchanged: `(event_name, event_id)` ledger uniqueness; provider
keys from canonical `event_id`; second UUID for same paid order
is fail-closed after cutover.

### Purchase paid-state / refund semantics / attribution /

browser / PascalCase / replay dispositions

| Source                                            | Disposition                                                    |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Admin notification Order payment → orders-paid    | `KEEP_AUTHORITATIVE` (live; verified)                          |
| Admin notification Refund create → refunds-create | `KEEP_AUTHORITATIVE` (live sub; accept schema-blocked)         |
| GraphQL webhookSubscription\* for these topics    | `FORBIDDEN` under this model                                   |
| shopify.app.toml / Partner deploy                 | `NOT_APPLICABLE`                                               |
| Browser purchase                                  | `ARCHIVE_NO_EXECUTION`                                         |
| Server meta-purchase-replay / force-resend        | `DISABLE_BEFORE_CUTOVER` → `ARCHIVE_NO_EXECUTION` until CE-2.6 |
| `ops_backfill` competing inserts                  | `HISTORICAL_ONLY` / `DISABLE_BEFORE_CUTOVER`                   |
| Reconciliation                                    | `KEEP_RECONCILIATION`                                          |
| Meta / Google / Microsoft / GTM / GA              | never owner                                                    |

### Cutover sequence

```text
1. subscription/source establishment (CE-2.3A evidence complete;
   governance ACCEPTED pending DEC-012)
2. refund 2026-04 schema remediation (separate approved code task)
3. reconciliation implementation (CE-2.3B)
4. purchase cutover (CE-2.4)
5. refund cutover (CE-2.5)
6. replay containment (CE-2.6A/B)
7. production proof (CE-2.7)
```

### Production proof (before closing double-count interlock)

- verified Admin notification Order payment webhook still points
  at production `orders-paid` with `SHOPIFY_WEBHOOK_SECRET`;
- refunds-create notification webhook remains live and accept
  path is schema-compatible;
- live deterministic purchase without competing server UUID for
  the same `transaction_id`;
- zero new meta-purchase-replay overlaps in the proof window.

### Operator and incident response

Unchanged Sev-1 treatment for webhook ∩ server distinct
`event_id`s; freeze force-resend; no third event_id “fix”.

## Preconditions

1. CE-2.3A evidence remains the technical basis for live
   destinations; no GraphQL duplicates.
2. Refund schema remediation requires a separate explicit
   approved code task (not authorized by DEC-012 alone).
3. Replay freeze (SAFE-001 / DEV-018) remains until CE-2.6.
4. CE-2.3B+ reconciliation designed before cutover.
5. Independent gates; no combined deploy.
6. DEC-007 respected until live ownership is evidenced per event.

## Consequences

- CE-2.2B / DEC-012 and CE-2.3A are owner-ACCEPTED
  (`SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER`).
- Active blockers remain: `STOP_ACTIVE_DOUBLE_COUNT_RISK` and
  `STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE`.
- No runtime or schema mutation is authorized by this acceptance.
- Do not auto-start CE-2.3B or refund schema fix without a new
  explicit start order.

## References

- CE-2.1 evidence (ACCEPTED)
- CE-2.3A evidence (verifier APPROVE; owner ACCEPTED with payload
  blocker)
- CE-2.2 / CE-2.2A / CE-2.2B (DEC-012 ACCEPTED)
- DEC-006, DEC-007, DEC-010, DEC-011, DEC-012
- SAFE-001 / SAFE-002 / DEV-018
- `src/lib/shopify/verifyWebhook.ts` (`SHOPIFY_WEBHOOK_SECRET`)
