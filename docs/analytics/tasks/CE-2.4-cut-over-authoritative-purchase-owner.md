# CE-2.4 — Cut over the authoritative Purchase owner

```text
Charter-version: 1.0.0
Roadmap: CE-2.4
Affected invariants: INV-001, INV-002, INV-003, INV-006, INV-010, INV-013, INV-014, INV-018, INV-019, INV-021
Goal: ensure one paid Shopify order creates one canonical purchase under the approved owner
Non-goals: provider finality redesign, historical replay, unrelated signal/schema work
Primary role: canonical-event-implementer
Status: STOPPED_PENDING_CE-2.4P1_ACCEPTANCE
Package: CE-2.4 — standalone Purchase owner cutover
```

## Preconditions

- CE-2.3A and CE-2.3C are independently verified and
  owner-accepted.
- CE-2.4P1 is committed, independently verified and
  owner-accepted.
- CE-2.3C accepted runtime SHA is
  `fde892700b9090a9db9b42ff19d3655444c7b60e`.
- Signal-contract integration is owner-accepted at runtime SHA
  `85b552a95d063e227232861bb226658ec653d960`.
- `STOP_CONCURRENT_RUNTIME_OWNERSHIP` is `CLOSED`.
- ADR-approved Purchase owner is explicit.
- Subscription/reconciliation source is testable.
- CE-2.1 identified every browser/server/backfill source.
- Production cutover plan and rollback commit are approved.
- Current purchase provider mapping tests are green.
- Start in a new clean worktree from the owner-accepted CE-2.4P1
  governance SHA after its fresh verifier gate.
- One writer must own the standalone CE-2.4 task. Its exact
  allowlist must not overlap CE-2.4P1, CE-3.3R or a separate
  provider/Purchase incident.

## Allowed files

The plan guardian must create an exact allowlist from CE-2.1 and
CE-2.2 before implementation. It must include only files required
for:

- authoritative owner activation;
- compatibility-source gating/removal;
- purchase source metadata;
- purchase tests;
- catalog/owner documentation when runtime truth changes.

Known candidates that must be inspected:

```text
src/lib/analytics/purchaseEvent.ts
src/lib/analytics/server/shopifyOrderToCanonicalPurchase.ts
src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts
src/lib/analytics/server/acceptCanonicalPurchase.ts
src/lib/analytics/server/normalizeCanonicalPurchase.ts
src/lib/analytics/server/getVerifiedShopifyCustomerContext.ts
src/lib/analytics/eventCatalog.ts
src/app/api/events/
src/app/api/shopify/webhooks/orders-paid/route.ts
```

Stop if the allowlist is not written into the task handoff before
edits.

## Required owner behavior

Exactly one paid order occurrence must map to:

```text
event_name = purchase
event_id = deterministicPurchaseEventId(order legacy ID)
transaction_id = shopifyPurchaseTransactionId(order legacy ID)
source = ADR-approved authoritative source
```

Retries, duplicate webhook deliveries, reconciliation overlap and
compatibility source arrival must return duplicate acceptance,
not a new event.

## Required source evidence

Persist or safely correlate:

```text
Shopify order legacy ID
Shopify webhook delivery ID when applicable
Shopify event ID when applicable
source method
source API version
source triggered/observed timestamp
```

Do not expose these as provider event IDs unless provider
contracts require them.

## Attribution continuity

Preserve the newest valid event-time attribution available
through the approved checkout/order snapshot:

```text
event_source_url
referrer_url
client_ip_address
client_user_agent
external_id
fbclid/click IDs
fbc
fbp
GA client/session IDs
Microsoft click ID
hashed contact identifiers
consent provenance
```

Do not replace customer IP/user-agent with webhook transport
context.

Do not regenerate `external_id`, `fbc`, `fbp` or event ID at
cutover.

## Browser/compatibility disposition

Apply the exact ADR decision:

```text
disable
remove
retain temporarily as duplicate-safe compatibility
retain as browser provider mirror only
```

A retained browser provider mirror must use the same canonical
event ID and semantics. It must not independently persist a
competing canonical purchase.

No UI success page may create a second purchase because of
refresh/navigation.

## Commerce correctness

Preserve and test:

- currency;
- total value;
- item revenue;
- tax;
- shipping;
- transaction discount;
- coupon codes;
- items and quantities;
- Shopify variant/SKU identity;
- order name;
- processed/paid event time.

No provider-specific field enters the canonical purchase schema.

## TDD proof

Required tests:

1. webhook owner accepts one purchase;
2. reconciliation of the same order is duplicate;
3. duplicate webhook delivery is duplicate;
4. compatibility/browser source for the same order is duplicate
   or disabled;
5. same order retry preserves event ID;
6. a different paid order creates a different event ID;
7. missing/denied attribution does not fabricate identifiers;
8. valid checkout attribution is preserved;
9. provider plan has at most one attempt per provider/idempotency
   key;
10. no direct provider send occurs.

## Production cutover gate

Before production activation:

- deploy candidate is independently audited;
- subscription/source is active;
- reconciliation cron/source is ready;
- browser compatibility decision is deployed atomically with
  owner activation;
- rollback restores the previous source without replaying orders;
- controlled order ID/event ID is pre-recorded.

After deploy, prove:

```text
Shopify paid state
→ one canonical ledger row
→ qualified provider attempts
→ later outbox processing
→ no second purchase from browser/reconciliation/retry
```

## Verification

Run all purchase, Shopify webhook, reconciliation, provider-plan
and mapper tests, then full analytics/cron, typegen, TypeScript
and build.

Run PII-free SQL assertions against a test database or isolated
fixture.

## Commit and stop

Commit exactly one purchase-owner cutover:

```bash
git commit -m "feat(analytics): cut over authoritative purchase owner"
```

No production push/deploy without CE-2.4 release approval. After
the approved release and Purchase production proof, CE-3.3R is
the next task. Do not begin CE-2.5 before CE-3.3R is
independently verified and owner-accepted.
