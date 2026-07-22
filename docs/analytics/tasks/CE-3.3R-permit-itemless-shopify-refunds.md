# CE-3.3R — Permit legitimate itemless Shopify refunds

```text
Charter-version: 1.0.0
Roadmap: CE-3.3 prerequisite for CE-2.5
Affected invariants: INV-001, INV-003, INV-005, INV-010,
  INV-012, INV-015, INV-019, INV-021, INV-022
Goal: accept a valid Shopify refund with items: [] without
  fabricating commerce data or changing refund identity
Non-goals: Refund owner cutover, settlement finality, source
  evidence, production mutation, provider activation, replay,
  push or deploy
Primary role: canonical-event-implementer
Status: IMPLEMENTED — LOCAL VERIFICATION PASS
Start SHA: b858a9a309abd445fcf2bc40227d5cd608f67db0
Branch: codex/ce-2.4-purchase-owner
Worktree: /Users/kristofferohnstadhjelmeland/utekos-headless/.worktrees/ce-2.4-purchase-owner
Writer: /root — sole writer
Writer overlap: NONE
Integrated fresh verifier: PENDING AFTER CE-2.5
```

## Owner decision

The project owner authorized CE-3.3R on 2026-07-21. The owner
later replaced the intermediate stop with one unified Commerce
Stabilization release candidate: one branch, one sole writer,
logical commits for source evidence, itemless refunds and
ownership cutover, then one fresh verifier for the complete
candidate. This task therefore creates no docs-only stop or
separate verifier cycle before CE-2.5.

The binding default sequence is:

```text
CE-2.4P1 accepted
→ CE-2.4 Purchase cutover
→ release approval and Purchase production proof
→ CE-3.3R
→ fresh verifier and owner acceptance
→ CE-2.5 Refund cutover
```

CE-2.4 production proof completed before this task started. The
same release-candidate worktree is reused serially after proving
that the prior writer is closed and no active writer owns an
allowlisted file.

## Contract

A legitimate Shopify Refund may contain:

```text
items: []
```

This includes shipping-only and order-adjustment refunds with no
refund line items.

The implementation must:

- keep `items` as an explicit array;
- never fabricate a product or placeholder item;
- preserve `refund_id`, the original `transaction_id`,
  deterministic `event_id`, `event_time`, `currency` and total
  `value`;
- keep one deterministic Refund ID per Shopify refund legacy ID;
- preserve refund-created semantics independently of financial
  settlement status;
- keep actual invalid amount, currency and identity inputs
  fail-closed;
- make every active provider mapper handle an empty item array
  without rejecting an otherwise valid refund;
- preserve existing behavior for line-item refunds.

For Google Analytics, `items` is optional on `refund`. If the
Data Manager event has no items, its `cartData` must be omitted;
an empty `cartData.items` list is not valid Data Manager cart
data. Existing non-empty refund items continue to map normally.

## Exact allowlist gate

Frozen before the first CE-3.3R write:

```text
docs/analytics/current-handoff.md
docs/analytics/program-state.json
docs/analytics/tasks/CE-3.3R-permit-itemless-shopify-refunds.md
docs/analytics/event-matrix.md
docs/analytics/provider-matrix.md
src/lib/analytics/refundEvent.ts
src/lib/analytics/canonicalEvent.test.ts
src/lib/analytics/server/shopifyRefundWebhookPayload.ts
src/lib/analytics/server/shopifyRefundWebhookPayload.test.ts
src/lib/analytics/server/shopifyRefundToCanonicalRefund.ts
src/lib/analytics/server/shopifyRefundToCanonicalRefund.test.ts
src/lib/analytics/server/shopifyGraphqlRefundToCanonicalRefund.ts
src/lib/analytics/server/shopifyGraphqlRefundToCanonicalRefund.test.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.test.ts
src/lib/analytics/server/runShopifyCommerceReconciliation.test.ts
src/lib/analytics/server/mapCanonicalRefundToGoogleDataManager.ts
src/lib/analytics/server/mapCanonicalRefundToGoogleDataManager.test.ts
src/lib/analytics/server/planCanonicalEventDispatch.test.ts
```

Before the first runtime write, freeze a separate exact, no-glob
allowlist in `docs/analytics/current-handoff.md`. It may contain
only the canonical refund item/value contract, Shopify webhook
and reconciliation refund schemas/mappers, active refund provider
mappers, catalog truth, targeted tests and required task/handoff
updates.

Stop if:

- the allowlist overlaps another active writer;
- an item would need to be invented;
- canonical or provider event identity would change;
- settlement semantics would replace refund-created semantics;
- a production mutation, provider activation, reconciliation
  execution, replay, push or deploy would be required.

## TDD proof

Write failing tests first for at least:

1. line-item refund;
2. shipping-only refund;
3. adjustment-only refund;
4. duplicate webhook;
5. reconciliation duplicate;
6. two distinct refunds on the same order;
7. no fabricated items;
8. provider planning without duplicate attempts;
9. active provider mapping with `items: []`;
10. invalid amount, currency and identity remain fail-closed.

Run targeted refund contract, webhook, reconciliation,
provider-plan and mapper tests, then the repository-required
typegen, TypeScript and build gates.

## Official sources

- Shopify, `RefundInput`:
  <https://shopify.dev/docs/api/admin-graphql/latest/input-objects/RefundInput>
- Google Analytics, `refund` event:
  <https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events#refund>
- Google Data Manager API, cart data:
  <https://developers.google.com/data-manager/api/devguides/events/send-events#add_cart_data>

## Commit and stop

Commit only the frozen CE-3.3R allowlist:

```bash
git commit -m "fix(analytics): permit itemless Shopify refunds"
```

The older intermediate stop is superseded by the unified release
instruction. Create the logical commit, continue CE-2.5 in the
same sole-writer worktree and run one fresh verifier after the
complete candidate.

## Local implementation evidence

```text
TDD red: 10 expected failures
Focused refund suite: 73/73 PASS
Full analytics/cron suite: 443/443 PASS
Targeted ESLint: PASS
Next typegen: PASS on Node 24.17.0
TypeScript: PASS on Node 24.17.0
Next.js 16.2.9 Turbopack production build: PASS on Node 24.17.0
Build boundary: NODE_OPTIONS, DOTENV_CONFIG_PATH and
  SHOPIFY_ADMIN_API_TOKEN unset
Tracking gateway smoke: PASS (https://utekos.no)
Production refund test: NOT PERFORMED
Reconciliation execution: NOT PERFORMED
Provider mutation: NOT PERFORMED
Runtime commit: THIS COMMIT
Integrated fresh verifier: PENDING AFTER CE-2.5
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Implementation behavior:

- Shopify webhook and reconciliation retain `items: []` for
  shipping-only and adjustment-only refunds;
- webhook total value comes from refund transactions;
- reconciliation total value and currency come from Shopify
  `Refund.totalRefundedSet`;
- line-item refunds retain normal item mapping;
- Google Data Manager omits serialized `cartData` when no items
  exist;
- deterministic Refund identity and original Purchase
  `transaction_id` are unchanged;
- transaction status is not used as settlement finality;
- invalid amount, currency and Shopify identity remain
  fail-closed.
