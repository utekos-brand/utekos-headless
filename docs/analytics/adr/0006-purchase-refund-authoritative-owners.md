# ADR-0006 — Authoritative Purchase and Refund owners

```text
Charter-version: 1.0.0
Roadmap task: CE-2.2
Affected invariants: INV-001, INV-002, INV-003, INV-010, INV-014,
  INV-015, INV-017, INV-020, INV-021
Decision-log entry: DEC-010
Status: PROPOSED_FOR_OWNER_APPROVAL
Date: 2026-07-21
Primary evidence: docs/analytics/evidence/
  ce-2.1-shopify-commerce-delivery-source-inventory.md
```

## Context

CE-2.1 proved:

```text
purchase → MULTIPLE_SOURCES
  webhook=12, server=3, ops_backfill=3
refund   → NO_SOURCE
program  → STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Shop-specific Admin `webhookSubscriptions` and REST webhooks are
empty (including `ORDERS_PAID` / `REFUNDS_CREATE`), while
production still receives live
`POST /api/shopify/webhooks/orders-paid` (202/200). Subscription
ownership is therefore **app-specific / UNKNOWN** (SAFE-002), not
shop-specific.

Three `payload.custom_data.transaction_id` values appear under
both `webhook` and `server` with **distinct** `event_id`s (Meta
purchase replay / DEV-018 / SAFE-001). That active double-count
risk is the problem this ADR binds a cutover decision for — not a
reason to refuse an owner model.

DEC-007 remains binding: a webhook **route** is not a proven
production owner until subscription, delivery, and identity are
established.

## Decision

### Purchase owner model

```text
APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
```

### Refund owner model

```text
APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
```

### ADR conclusion

```text
APPROVED_WITH_PRECONDITIONS
```

`STOP_ACTIVE_DOUBLE_COUNT_RISK` remains the active program
interlock until the independent gates **purchase cutover** and
**replay containment** close webhook ∩ server overlaps with
distinct `event_id`s. The owner **models** above are approved
under the preconditions in this ADR.

## Alternatives considered

### `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`

Rejected for both events. CE-2.1 shows zero shop-specific
subscriptions while live `orders-paid` traffic exists. Choosing
shop-specific would invent an owner that is not live and would
conflict with the observed delivery path.

### `RECONCILIATION_ONLY`

Rejected as sole authoritative owner. Target architecture
requires verified Shopify delivery for commerce events.
Reconciliation is mandatory coverage for missed deliveries, not a
substitute for the live webhook owner.

### `TEMPORARY_COMPATIBILITY_SOURCE_WITH_CUTOVER`

Rejected as the durable owner. Server/`ops_backfill` paths that
mint new purchase `event_id`s for already-accepted orders are the
active double-count vector. They may only exist under an explicit
CE-2.6 replay contract after freeze — never as competing
authoritative owners.

## Decision dimensions

### Authoritative trigger semantics

| Event    | Authoritative trigger                            |
| -------- | ------------------------------------------------ |
| purchase | Shopify `ORDERS_PAID` (order reaches paid)       |
| refund   | Shopify `REFUNDS_CREATE` (Refund record created) |

One paid Shopify order → at most one canonical `purchase`. One
Shopify Refund ID → exactly one canonical `refund`.

### Webhook subscription method

**App-specific** HTTPS callbacks for `ORDERS_PAID` and
`REFUNDS_CREATE` targeting the existing accept-only routes:

- `/api/shopify/webhooks/orders-paid`
- `/api/shopify/webhooks/refunds-create`

CE-2.3A must prove or establish the Partner/app-released
subscription config (closes SAFE-002). Shop-specific Admin
subscriptions are not the chosen owner path.

HMAC verification on the existing handlers remains mandatory.

### Reconciliation query/source

A bounded Shopify Admin reconciliation job (CE-2.3B) must:

- use a bounded `updated_at` overlap window;
- paginate and handle rate limits;
- avoid full unbounded order scans in normal cron;
- be duplicate-safe across overlap;
- reuse canonical ledger + provider outbox (INV-017: no new
  queue);
- use an overlap-safe job lease;
- fetch read-only from Shopify, then accept via normal canonical
  acceptance paths;
- provide an explicit historical backfill path separate from
  normal cron.

Reconciliation is `KEEP_RECONCILIATION`, never a second
authoritative owner.

### Canonical event-ID derivation

Preserve existing deterministic helpers unless a later
compatibility ADR proves a stronger contract:

```text
purchase event_id:
  deterministicPurchaseEventId(shopify order legacy ID)

purchase transaction_id:
  shopifyPurchaseTransactionId(shopify order legacy ID)
  (= shopify_order_{legacyId})

refund event_id:
  deterministicRefundEventId(shopify refund legacy ID)

refund refund_id:
  shopifyRefundRecordId(shopify refund legacy ID)

refund transaction_id:
  original Shopify purchase transaction ID
  (shopifyPurchaseTransactionId(order legacy ID))
```

### Shopify delivery / event ID usage

- `X-Shopify-Webhook-Id` — delivery retry dedupe only; must not
  replace the canonical `event_id`.
- `X-Shopify-Event-Id` — merchant-action correlation evidence
  only; must not silently replace order/refund-derived canonical
  IDs.

### Ledger / provider idempotency

- Ledger uniqueness: `(event_name, event_id)` for canonical
  acceptance.
- Provider attempts: existing provider idempotency keys derived
  from the canonical `event_id` (no second attempt stream for a
  competing UUID for the same paid order).
- After cutover, accepting a second purchase for the same order
  legacy ID with a different `event_id` is a **fail-closed
  incident**, not a compatibility feature.

### Purchase paid-state definition

`ORDERS_PAID` is the authoritative paid trigger once the
app-specific subscription is proven/established.

- Partial payment / later edits after the first paid acceptance
  do **not** mint a second canonical purchase.
- Manual mark-as-paid that yields `ORDERS_PAID` (or
  reconciliation equivalent paid state) may create the **first**
  canonical purchase only.
- Chargebacks, cancellations, and full refunds do not rewrite
  purchase ownership; they may produce separate `refund` (or
  future) events.

### Refund-created versus refund-settled

```text
canonical refund = creation of one Shopify Refund record
```

Settlement / capture / financial transaction status is separate
evidence and must not silently redefine `refund`.

### Checkout / Klarna attribution inheritance

Webhook and reconciliation acceptance must continue to inherit
checkout/Klarna attribution and consent snapshots from existing
note-attribute / checkout snapshot contracts used by the current
mappers. No new attribution owner is introduced by this ADR.

### Browser purchase disposition

```text
ARCHIVE_NO_EXECUTION
```

No `/api/events/purchase` route; published GTM excludes
`purchase` / `Purchase`. Do not reintroduce browser purchase as
an owner or temporary compatibility source without a new ADR.

### Historical PascalCase disposition

```text
HISTORICAL_ONLY
```

Legacy `Purchase` / `Refund` rows are not a live owner and must
not be re-activated.

### Existing backfill / replay disposition

| Source                                     | Disposition                                                       |
| ------------------------------------------ | ----------------------------------------------------------------- |
| App-specific ORDERS_PAID / REFUNDS_CREATE  | `KEEP_AUTHORITATIVE` (after CE-2.3A prove/establish)              |
| Shop-specific webhook                      | `ARCHIVE_NO_EXECUTION`                                            |
| Browser purchase                           | `ARCHIVE_NO_EXECUTION`                                            |
| Server meta-purchase-replay / force-resend | `DISABLE_BEFORE_CUTOVER` then `ARCHIVE_NO_EXECUTION` until CE-2.6 |
| `ops_backfill` competing purchase inserts  | `HISTORICAL_ONLY` / `DISABLE_BEFORE_CUTOVER` for new execution    |
| Reconciliation job                         | `KEEP_RECONCILIATION`                                             |
| Meta / Google / Microsoft / GTM / GA       | provider derivation / corroboration only — never owner            |

Any path that mints a **new** purchase `event_id` for an order
already accepted under the deterministic webhook ID is forbidden
until CE-2.6 defines a dry-run, bounded, audited replay contract
that preserves or explicitly maps identity.

### Cutover sequence (independent gates)

Do not combine into one deployment:

```text
1. subscription/source establishment   (CE-2.3A)
2. reconciliation implementation       (CE-2.3B)
3. purchase cutover                    (CE-2.4)
4. refund cutover                      (CE-2.5)
5. replay containment                  (CE-2.6A/B)
6. production proof                    (CE-2.7 / phase gate)
```

### Rollback owner

Until CE-2.4/2.5 production proof, rollback means:

- leave accept-only routes in place;
- do not register competing shop-specific owners;
- keep replay/force-resend disabled;
- revert only the specific subscription/reconciliation change
  under explicit owner approval.

After cutover, rollback requires an explicit incident
ADR/decision; it must not re-enable UUID-minting replays against
live webhook orders.

### Production proof

Required before closing `STOP_ACTIVE_DOUBLE_COUNT_RISK`:

- proven app-specific subscription ownership (SAFE-002);
- at least one live deterministic `purchase` ledger row from
  webhook or reconciliation with no competing server UUID for the
  same `transaction_id`;
- refund path either live-proven or explicitly deferred with
  reconciliation coverage after CE-2.5;
- zero new meta-purchase-replay overlaps in the proof window.

### Operator and incident response

- Treat webhook ∩ server distinct `event_id` for the same
  `shopify_order_*` as Sev-1 measurement integrity.
- Freeze force-resend / unbounded backfill immediately on
  recurrence.
- Prefer ledger+outbox audit over provider dashboard counts.
- Do not “fix” double-count by sending a third event_id.

## Purchase semantics (summary)

- `event_time`: Shopify `processed_at ?? created_at` per current
  `shopifyOrderToCanonicalPurchase` mapper contract.
- Amount / currency / items / tax / shipping / discount: from the
  Shopify order payload via the existing mapper.
- Browser compatibility period as owner: **none**.

## Refund semantics (summary)

- Currently `NO_SOURCE` in production; this ADR still selects the
  owner **model** so CE-2.3A/2.5 can establish it without
  re-opening CE-2.2.
- Absence of refund today is acceptable only as a temporary gap
  until subscription/source establishment and refund cutover —
  not as permanent non-ownership.

## Preconditions (must hold before claiming live ownership)

1. CE-2.3A proves or establishes app-specific `ORDERS_PAID` /
   `REFUNDS_CREATE` delivery to the existing routes (SAFE-002).
2. Force-resend / UUID-minting purchase replay remains disabled
   for orders already present as webhook purchases (SAFE-001 /
   DEV-018).
3. CE-2.3B reconciliation is designed to the requirements above
   before purchase/refund cutover.
4. CE-2.4/2.5/2.6 execute as separate gates; no combined deploy.
5. DEC-007 is respected until precondition (1) is evidenced.

## Compatibility with DEC-007

This ADR approves the **target** owner model. It does **not**
claim that webhook delivery is already a fully proven production
owner. CE-2.1’s UNKNOWN app-config gap remains until CE-2.3A
evidence.

## Consequences

- CE-2.3A may proceed after owner ACCEPTED of this ADR/DEC-010.
- Roadmap points for CE-2.2 become accepted only after owner
  ACCEPTED — not at commit time.
- `STOP_ACTIVE_DOUBLE_COUNT_RISK` stays in program state /
  handoff until purchase cutover + replay containment are proven.
- No runtime, schema, env, Shopify subscription mutation, push,
  or deploy is authorized by this ADR alone.

## References

- CE-2.1 evidence inventory (ACCEPTED)
- DEC-006 Meta purchase replay fail-closed
- DEC-007 Shopify webhook route ≠ production owner
- SAFE-001 / SAFE-002 / DEV-018
- Target architecture §2 commerce webhook owner class
