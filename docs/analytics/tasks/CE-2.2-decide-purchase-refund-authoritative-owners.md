# CE-2.2 — Decide authoritative Purchase and Refund owners

```text
Charter-version: 1.0.0
Roadmap: CE-2.2
Affected invariants: INV-001, INV-002, INV-003, INV-010, INV-014, INV-015, INV-017, INV-020, INV-021
Goal: approve one authoritative source model for purchase and one for refund
Non-goals: implement subscriptions/reconciliation, change runtime/schema/env, replay, push/deploy
Primary role: canonical-event-plan-guardian
Supporting roles: canonical-event-evidence-auditor and canonical-event-provider-auditor, read-only
```

## Preconditions

- CE-2.1 is independently verified and owner-accepted.
- CE-2.1 does not have an unresolved security/consent stop.
- Read the charter, target architecture, roadmap, decision log,
  CE-2.1 evidence and complete current source code.
- Resolve the next free ADR and decision-log numbers. Do not
  overwrite an existing ADR or decision.

## Allowed files

Only:

```text
docs/analytics/adr/0006-purchase-refund-authoritative-owners.md
docs/analytics/decision-log.md
docs/analytics/current-handoff.md
```

If ADR number `0006` is already occupied locally, stop. The plan
guardian must assign the next free number and update this task
before any writer proceeds.

The new decision-log entry is:

```text
DEC-010 — Authoritative Purchase and Refund owners
```

If `DEC-010` is occupied locally, stop and renumber through a
docs-only task.

## Required decision

Choose exactly one owner model for `purchase` and one for
`refund`:

```text
APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
RECONCILIATION_ONLY
TEMPORARY_COMPATIBILITY_SOURCE_WITH_CUTOVER
```

The decision may differ between purchase and refund, but each
event has only one authoritative owner after cutover.

## Required decision dimensions

The ADR must decide:

- authoritative trigger semantics;
- webhook subscription method;
- reconciliation query/source;
- canonical event-ID derivation;
- Shopify event/delivery ID usage;
- ledger/provider idempotency keys;
- purchase paid-state definition;
- refund-created versus refund-settled semantics;
- checkout/Klarna attribution inheritance;
- browser purchase disposition;
- historical PascalCase disposition;
- existing backfill/replay disposition;
- cutover sequence;
- rollback owner;
- production proof;
- operator and incident response.

## Required identity rules

Unless CE-2.1 proves a stronger compatible contract, preserve:

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

`X-Shopify-Webhook-Id` deduplicates retries of one delivery. It
must not replace the canonical event ID.

`X-Shopify-Event-Id` correlates deliveries caused by the same
merchant action. It may be persisted as source evidence, but must
not silently replace the order/refund-derived canonical ID
without a separate compatibility proof.

## Required purchase semantics

The ADR must specify:

- whether `ORDERS_PAID` is authoritative;
- treatment of partial payment, manual mark-as-paid and later
  edits;
- whether an order can produce more than one canonical purchase;
- source of `event_time`;
- source of amount/currency/items/tax/shipping/discount;
- treatment of chargebacks, cancellations and full refund;
- browser purchase compatibility period and removal gate.

## Required refund semantics

The ADR must state:

```text
canonical refund = creation of one Shopify Refund record
```

unless CE-2.1 proves a different approved business event.

The existence of a Shopify Refund object does not prove
successful financial settlement. Settlement/transaction status is
separate evidence and must not silently change the meaning of
`refund`.

One Shopify refund ID produces one canonical refund event.

## Required reconciliation model

The ADR must require:

- a bounded `updated_at` overlap window;
- deterministic/idempotent acceptance;
- pagination;
- rate-limit handling;
- no full unbounded order scan in normal cron;
- duplicate-safe overlap;
- explicit historical backfill path;
- no new event/provider queue;
- reuse of canonical ledger/outbox;
- overlap-safe job lease;
- read-only source fetch followed by normal canonical acceptance.

## Required provider and browser disposition

For every current source, choose:

```text
KEEP_AUTHORITATIVE
KEEP_TEMPORARY_COMPATIBILITY
KEEP_RECONCILIATION
DISABLE_BEFORE_CUTOVER
ARCHIVE_NO_EXECUTION
HISTORICAL_ONLY
```

Meta, Google, Microsoft, GTM and GA do not own purchase/refund.
They receive derived provider events or supply corroborating
browser evidence.

## Required rollout

The ADR must define these independent gates:

```text
subscription/source establishment
reconciliation implementation
purchase cutover
refund cutover
replay containment
production proof
```

Do not combine all gates into one deployment.

## Required ADR conclusion

Return:

```text
APPROVED_OWNER_MODEL
APPROVED_WITH_PRECONDITIONS
REJECTED_NEEDS_MORE_EVIDENCE
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Owner approval is required before CE-2.3A.

## Validation and commit

```bash
pnpm exec prettier --check \
  docs/analytics/adr/0006-purchase-refund-authoritative-owners.md \
  docs/analytics/decision-log.md \
  docs/analytics/current-handoff.md
git diff --check
```

Commit one docs-only decision:

```bash
git add \
  docs/analytics/adr/0006-purchase-refund-authoritative-owners.md \
  docs/analytics/decision-log.md \
  docs/analytics/current-handoff.md
git commit -m "docs(analytics): decide Shopify commerce event owners"
```

No external mutation. Stop after fresh verifier review and owner
acceptance.
