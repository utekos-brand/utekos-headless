# ADR-0006 — Authoritative Purchase and Refund owners

```text
Charter-version: 1.0.0
Roadmap task: CE-2.2 / CE-2.2A / CE-2.2B
Affected invariants: INV-001, INV-002, INV-003, INV-010, INV-014,
  INV-015, INV-017, INV-020, INV-021
Decision-log entry: DEC-010 (amended by DEC-011, DEC-012)
Status: APPROVED_WITH_PRECONDITIONS (amended CE-2.2B —
  pending owner ACCEPTED of DEC-012)
Date: 2026-07-21
Amended: 2026-07-21 (CE-2.2A, CE-2.2B)
Primary evidence: docs/analytics/evidence/
  ce-2.1-shopify-commerce-delivery-source-inventory.md
Owner fact (CE-2.2B): Shopify Admin → Settings → Notifications →
  Webhooks delivers Order payment to
  https://utekos.no/api/shopify/webhooks/orders-paid
```

## Context

CE-2.1 proved:

```text
purchase → MULTIPLE_SOURCES
  webhook=12, server=3, ops_backfill=3
refund   → NO_SOURCE
program  → STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Admin GraphQL `webhookSubscriptions` / REST `webhooks.json` were
empty for the inspected token, while production still received
live `POST /api/shopify/webhooks/orders-paid`. That gap is now
explained:

### CE-2.2B — Shopify Admin notification webhooks

Verified production purchase webhook:

```text
Management surface:
  Shopify Admin → Settings → Notifications → Webhooks
Event:
  Order payment
Destination:
  https://utekos.no/api/shopify/webhooks/orders-paid
Format:
  JSON
Signing secret:
  Shop-level notification webhook secret
Runtime env:
  SHOPIFY_WEBHOOK_SECRET
```

Shopify Admin-created **notification** webhook subscriptions are
shop-attached and are **not** returned by Admin API
`webhookSubscriptions`. Therefore:

- empty `webhookSubscriptions` does **not** prove absence of the
  live `orders-paid` delivery path;
- `webhookSubscriptionCreate` must **not** be used to “fix” or
  duplicate the existing Order payment notification webhook;
- HMAC verification continues via `SHOPIFY_WEBHOOK_SECRET` (shop
  notification secret), not the custom app API secret key.

### Role of custom app “Utekos Storefront”

The Admin API token for **Utekos Storefront**
(`erling-7921.myshopify.com`) is used for:

- read-only identity control;
- Shopify reconciliation (CE-2.3B+);
- other future Admin API operations when separately approved;

It does **not** own or represent the existing notification
webhook. The app API secret key must **not** replace
`SHOPIFY_WEBHOOK_SECRET` while notification webhooks are the
authoritative model.

### Prior amendments

- CE-2.2 initially chose
  `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION` (toml/Partner) — not
  applicable to this storefront setup.
- CE-2.2A chose `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  (GraphQL `webhookSubscriptionCreate`) — wrong management
  surface for the live Order payment webhook.
- CE-2.2B replaces both with notification-webhook ownership
  below.

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
APPROVED_WITH_PRECONDITIONS
```

### CE-2.3A implementation posture

```text
orders-paid:
  VERIFY ONLY — already active; do not create; do not duplicate

refunds-create:
  PLAN manual Shopify Admin → Notifications → Webhooks creation
  (separate explicit owner approval before any Admin UI change)

GraphQL webhookSubscriptionCreate / webhookSubscriptionUpdate
  for ORDERS_PAID / REFUNDS_CREATE under this owner model:
  FORBIDDEN

Mode A (shopify.app.toml / shopify app deploy):
  NOT_APPLICABLE

Mode B (Admin API subscription create for these topics):
  FORBIDDEN under this owner model
```

## Alternatives considered

### `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`

Rejected / superseded — no released `shopify.app.toml` path for
this production delivery.

### `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`

Rejected / superseded by CE-2.2B — Admin API
`webhookSubscriptions` cannot see or safely manage the live
notification webhook; creating GraphQL subscriptions would risk
`STOP_DUPLICATE_SUBSCRIPTIONS` against the existing Order payment
destination.

### `RECONCILIATION_ONLY`

Rejected as sole owner. Verified Shopify delivery remains
required; reconciliation covers missed deliveries only.

### `TEMPORARY_COMPATIBILITY_SOURCE_WITH_CUTOVER`

Rejected as durable owner. Server/`ops_backfill` UUID-minting
paths remain the active double-count vector until CE-2.6.

## Decision dimensions

### Authoritative trigger semantics

| Event    | Authoritative trigger                                       |
| -------- | ----------------------------------------------------------- |
| purchase | Shopify Admin notification **Order payment**                |
| refund   | Shopify Admin notification **Refund create** (to establish) |

One paid Shopify order → at most one canonical `purchase`. One
Shopify Refund ID → exactly one canonical `refund`.

### Webhook subscription method

**Shopify Admin → Settings → Notifications → Webhooks** for:

- Order payment → `/api/shopify/webhooks/orders-paid`
  (**active**)
- Refund create → `/api/shopify/webhooks/refunds-create`
  (**planned manual create**; not auto-created by agents)

HMAC: shop-level notification signing secret via
`SHOPIFY_WEBHOOK_SECRET` (`verifyShopifyWebhook`).

Do **not**:

- create GraphQL Admin API subscriptions for these topics;
- replace `SHOPIFY_WEBHOOK_SECRET` with the app API secret key;
- invent a second `orders-paid` destination.

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

Unchanged from CE-2.2 except subscription disposition table:

| Source                                            | Disposition                                                    |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Admin notification Order payment → orders-paid    | `KEEP_AUTHORITATIVE` (verify; already live)                    |
| Admin notification Refund create → refunds-create | `KEEP_AUTHORITATIVE` after manual establish                    |
| GraphQL webhookSubscription\* for these topics    | `FORBIDDEN` under this model                                   |
| shopify.app.toml / Partner deploy                 | `NOT_APPLICABLE`                                               |
| Browser purchase                                  | `ARCHIVE_NO_EXECUTION`                                         |
| Server meta-purchase-replay / force-resend        | `DISABLE_BEFORE_CUTOVER` → `ARCHIVE_NO_EXECUTION` until CE-2.6 |
| `ops_backfill` competing inserts                  | `HISTORICAL_ONLY` / `DISABLE_BEFORE_CUTOVER`                   |
| Reconciliation                                    | `KEEP_RECONCILIATION`                                          |
| Meta / Google / Microsoft / GTM / GA              | never owner                                                    |

### Cutover sequence

```text
1. subscription/source establishment (CE-2.3A: verify orders-paid;
   plan/manual refunds-create — no GraphQL create)
2. reconciliation implementation (CE-2.3B)
3. purchase cutover (CE-2.4)
4. refund cutover (CE-2.5)
5. replay containment (CE-2.6A/B)
6. production proof (CE-2.7)
```

### Active risk until cutover

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

### Production proof (before closing the interlock)

- verified Admin notification Order payment webhook still points
  at production `orders-paid` with `SHOPIFY_WEBHOOK_SECRET`;
- refunds-create notification webhook established when CE-2.5
  requires it (or explicit deferral);
- live deterministic purchase without competing server UUID for
  the same `transaction_id`;
- zero new meta-purchase-replay overlaps in the proof window.

### Operator and incident response

Unchanged Sev-1 treatment for webhook ∩ server distinct
`event_id`s; freeze force-resend; no third event_id “fix”.

## Preconditions

1. CE-2.3A verifies existing orders-paid notification webhook;
   does not create GraphQL duplicates.
2. Any Admin UI creation of refunds-create requires separate
   explicit owner approval.
3. Replay freeze (SAFE-001 / DEV-018) remains until CE-2.6.
4. CE-2.3B+ reconciliation designed before cutover.
5. Independent gates; no combined deploy.
6. DEC-007 respected until live ownership is evidenced per event.

## Consequences

- After owner ACCEPTED of CE-2.2B / DEC-012, CE-2.3A becomes a
  **verify + plan** task — not GraphQL subscription creation.
- No Shopify mutation is authorized by this amendment alone.
- Do not auto-create the refund notification webhook.

## References

- CE-2.1 evidence (ACCEPTED)
- CE-2.2 / CE-2.2A / CE-2.2B
- DEC-006, DEC-007, DEC-010, DEC-011, DEC-012
- SAFE-001 / SAFE-002 / DEV-018
- `src/lib/shopify/verifyWebhook.ts` (`SHOPIFY_WEBHOOK_SECRET`)
