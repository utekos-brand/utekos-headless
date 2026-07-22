# CE-2.5 — Cut over the authoritative Refund owner

```text
Charter-version: 1.0.0
Roadmap: CE-2.5
Affected invariants: INV-001, INV-002, INV-003, INV-006, INV-010, INV-015, INV-018, INV-019, INV-021
Goal: ensure one Shopify Refund record creates one canonical refund under the approved owner
Non-goals: treat settlement as refund creation, purchase redesign, provider finality redesign, historical replay
Primary role: canonical-event-implementer
Status: LOCAL_VERIFIED_PENDING_INTEGRATED_FRESH_VERIFIER
Package: CE-2.5 — standalone Refund owner cutover
Start SHA: 2755ae7fcfa405d5c9b3f6e495fd680bf5a5df6c
Branch: codex/ce-2.4-purchase-owner
Worktree: /Users/kristofferohnstadhjelmeland/utekos-headless/.worktrees/ce-2.4-purchase-owner
Writer: /root — sole writer
Writer overlap: NONE
```

## Preconditions

- CE-2.3C is owner-accepted at runtime SHA
  `fde892700b9090a9db9b42ff19d3655444c7b60e`.
- Signal-contract integration is owner-accepted at runtime SHA
  `85b552a95d063e227232861bb226658ec653d960`.
- `STOP_CONCURRENT_RUNTIME_OWNERSHIP` is `CLOSED`.
- CE-2.4 is independently verified, owner-accepted, released
  under separate approval and production-proven.
- CE-3.3R is committed and locally verified at
  `2755ae7fcfa405d5c9b3f6e495fd680bf5a5df6c`.
- CE-2.5 has its own writer, worktree and exact no-glob
  allowlist.
- CE-2.3A/CE-2.3C refund source path is available.
- ADR-approved Refund owner is explicit.
- Current live absence/presence of canonical refund rows is
  freshly verified.
- Rollback plan is approved.
- The later owner instruction authorizes the same clean,
  sole-writer release-candidate worktree and one integrated fresh
  verifier after CE-2.5. It supersedes the older intermediate
  CE-3.3R governance/verifier stop.
- A separate provider/Purchase incident must have a frozen
  allowlist that does not overlap this package.

## Allowed files

The exact no-glob allowlist was frozen before the first CE-2.5
write. A pre-write inspection found that the required original
Purchase-attribution linkage needed the existing store/acceptor
path; the final list was therefore expanded before any write and
then frozen at exactly these paths:

```text
docs/analytics/current-handoff.md
docs/analytics/program-state.json
docs/analytics/tasks/CE-2.5-cut-over-authoritative-refund-owner.md
docs/analytics/event-matrix.md
docs/analytics/provider-matrix.md
src/lib/analytics/eventCatalog.ts
src/lib/analytics/eventCatalog.test.ts
src/lib/analytics/server/assertCanonicalRefundIdentity.ts
src/lib/analytics/server/normalizeCanonicalRefund.ts
src/lib/analytics/server/normalizeCanonicalRefund.test.ts
src/lib/analytics/server/canonicalRefundOwnershipContract.test.ts
src/lib/analytics/server/acceptCanonicalRefund.ts
src/lib/analytics/server/canonicalEventStore.ts
src/lib/analytics/server/createCanonicalEventStore.ts
src/lib/analytics/server/postgresCanonicalPageViewStore.ts
src/lib/analytics/server/enrichCanonicalRefundFromPurchase.ts
```

`createCanonicalEventStore.ts` was inspected and authorized but
did not require a change. No active writer owns any listed path.

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

## Local implementation evidence

```text
TDD red: 5 expected failures
Focused ownership/refund/reconciliation/provider suite: 102/102 PASS
Authoritative owner: shopify_admin_notification_refund_create
Recovery source: reconciliation
Identity: deterministicRefundEventId(refund legacy ID)
Alternative event/refund/order identities: FAIL CLOSED
Canonical Purchase attribution lookup: deterministic order linkage
Webhook + reconciliation: same event_id, one ledger row
Source evidence: webhook + reconciliation observations retained
Provider planning: one Google attempt for one eligible key
Missing Purchase linkage: operational accept with no fabricated attribution or attempt
Direct provider send from request path: NONE
Itemless Refund: items=[]; no fabricated product
Settlement status: not used as Refund-creation gate
Full analytics/cron suite: 451/451 PASS
Targeted ESLint: PASS
Prettier: PASS
Next typegen: PASS on Node 24.17.0
TypeScript: PASS on Node 24.17.0
Next.js 16.2.9 Turbopack production build: PASS
Build boundary: NODE_OPTIONS, DOTENV_CONFIG_PATH and
  SHOPIFY_ADMIN_API_TOKEN unset
Tracking gateway smoke: PASS (read-only, https://utekos.no)
MCP build/doctor: BLOCKED — referenced scripts absent at start SHA
Integrated fresh verifier: PENDING
Production refund test: NOT PERFORMED
Push/deploy/reconciliation/backfill/provider mutation: NOT PERFORMED
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```
