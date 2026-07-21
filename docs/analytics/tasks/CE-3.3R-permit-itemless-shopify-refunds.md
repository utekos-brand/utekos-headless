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
Status: AUTHORIZED — SEQUENCED AFTER CE-2.4 PRODUCTION PROOF
Authorized start: separate clean worktree and exact no-glob
  allowlist; do not start from the CE-2.4P1 writer/worktree by default
```

## Owner decision

The project owner authorized CE-3.3R on 2026-07-21 as a separate
commerce item/value remediation. It must complete, receive a
fresh verifier verdict and be owner-accepted before CE-2.5
starts.

The binding default sequence is:

```text
CE-2.4P1 accepted
→ CE-2.4 Purchase cutover
→ release approval and Purchase production proof
→ CE-3.3R
→ fresh verifier and owner acceptance
→ CE-2.5 Refund cutover
```

Parallel development with CE-2.4P1 is forbidden unless an
explicit overlap gate proves zero shared files and each task has
its own writer and worktree.

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

Then stop for fresh verification and owner acceptance. Do not
start CE-2.5 automatically.
