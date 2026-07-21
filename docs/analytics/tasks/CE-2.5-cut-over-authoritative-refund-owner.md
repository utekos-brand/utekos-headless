# CE-2.5 — Cut over the authoritative Refund owner

```text
Charter-version: 1.0.0
Roadmap: CE-2.5
Affected invariants: INV-001, INV-002, INV-003, INV-006, INV-010, INV-015, INV-018, INV-019, INV-021
Goal: ensure one Shopify Refund record creates one canonical refund under the approved owner
Non-goals: treat settlement as refund creation, purchase redesign, provider finality redesign, historical replay
Primary role: canonical-event-implementer
Status: AUTHORIZED_CLEAN_WORKTREE_AFTER_SIGNAL_CONTRACT_ACCEPTANCE
Package: CE-2.4/CE-2.5 — Shopify Purchase and Refund ownership cutover
```

## Preconditions

- CE-2.3C is owner-accepted at runtime SHA
  `fde892700b9090a9db9b42ff19d3655444c7b60e`.
- Signal-contract integration is owner-accepted at runtime SHA
  `85b552a95d063e227232861bb226658ec653d960`.
- `STOP_CONCURRENT_RUNTIME_OWNERSHIP` is `CLOSED`.
- CE-2.4 and CE-2.5 share one approved package, one writer and
  one non-overlapping exact allowlist.
- The CE-2.4 purchase half is implemented and independently
  verified before the refund cutover is finalized. Deploy and
  production proof remain release gates, not prerequisites for
  starting the combined code package.
- CE-2.3A/CE-2.3C refund source path is available.
- ADR-approved Refund owner is explicit.
- Current live absence/presence of canonical refund rows is
  freshly verified.
- Rollback plan is approved.
- Start in a new clean worktree from the signal-contract
  governance-acceptance commit after clean-baseline gate.
- A separate provider/Purchase incident must have a frozen
  allowlist that does not overlap this package.

## Allowed files

The plan guardian must write an exact allowlist into the task
handoff from the accepted evidence.

Known candidates that must be inspected:

```text
src/lib/analytics/refundEvent.ts
src/lib/analytics/server/shopifyRefundWebhookPayload.ts
src/lib/analytics/server/shopifyRefundToCanonicalRefund.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts
src/lib/analytics/server/acceptCanonicalRefund.ts
src/lib/analytics/server/normalizeCanonicalRefund.ts
src/lib/analytics/eventCatalog.ts
src/app/api/shopify/webhooks/refunds-create/route.ts
```

Stop if implementation needs a file outside the approved exact
allowlist.

## Required semantic contract

One Shopify `Refund` record means one canonical event:

```text
event_name = refund
event_id = deterministicRefundEventId(refund legacy ID)
refund_id = shopifyRefundRecordId(refund legacy ID)
transaction_id = original Shopify purchase transaction ID
event_time = refund created timestamp
```

Refund creation is not equivalent to financial settlement.

Store transaction status as source evidence or future settlement
context only. Do not delay or duplicate the canonical `refund`
event based on transaction status unless the ADR explicitly chose
that meaning.

## Required idempotency proof

The same refund must remain duplicate-safe across:

```text
duplicate webhook delivery
Shopify retry
reconciliation overlap
manual rerun
process crash/restart
```

A second distinct refund against the same order must produce a
distinct refund event ID.

## Required data contract

Preserve/test:

- order transaction ID;
- refund record ID;
- currency;
- value;
- refunded items;
- quantities;
- unit price;
- SKU where available;
- partial versus full refund amount;
- created timestamp.

Do not fabricate items when a shipping-only or adjustment refund
lacks line items. If the current schema requires at least one
item and Shopify permits a valid refund without line items, stop
and create a separately approved schema change under CE-3.3
rather than inventing data.

## Consent and attribution

Refund provider eligibility must follow the approved
event-time/business contract.

Do not:

- reuse webhook transport IP/user-agent;
- infer consent from current browser state;
- invent Meta/Google/Microsoft identifiers;
- send a refund directly from the request handler;
- treat provider receipt as settlement proof.

When the original purchase attribution is required by a provider,
resolve it through the canonical purchase/order linkage, not a
new browser identifier.

## TDD proof

Required tests:

1. one refund is accepted;
2. duplicate webhook delivery is duplicate;
3. reconciliation of the same refund is duplicate;
4. two refunds on one order produce two event IDs;
5. event time is refund creation time;
6. refund-created semantics are independent of transaction
   settlement status;
7. partial refund value/items remain correct;
8. missing valid fields fail closed;
9. no provider attempt duplicates;
10. no direct provider send occurs.

## Production proof

Use an approved test/refund event only.

Prove:

```text
Shopify refund record
→ one canonical refund ledger row
→ expected qualified/skipped provider attempts
→ reconciliation sees duplicate
→ no second event from retry
```

Record refund ID hash, canonical event ID, deployment ID and
provider outcomes without PII.

## Verification and commit

Run targeted refund/webhook/reconciliation/provider-plan tests,
then full analytics/cron, typegen, TypeScript and build.

Commit:

```bash
git commit -m "feat(analytics): cut over authoritative refund owner"
```

No production push/deploy without explicit approval. Do not begin
CE-2.6 automatically.
