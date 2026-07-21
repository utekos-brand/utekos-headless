# CE-2.3B — Design the bounded Shopify commerce reconciliation

```text
Charter-version: 1.0.0
Roadmap: CE-2.3
Affected invariants: INV-002, INV-003, INV-006, INV-008, INV-014, INV-018, INV-019, INV-021
Goal: freeze an exact implementable reconciliation contract and file allowlist
Non-goals: write runtime code, create cron/schema/env, fetch unbounded history, replay, push/deploy
Primary role: canonical-event-plan-guardian
Supporting roles: canonical-event-evidence-auditor and canonical-event-database-auditor, read-only
Status: ACCEPTED
Conclusion: READY_FOR_CE_2_3C
```

## Acceptance (2026-07-21)

```text
CE-2.3B: ACCEPTED
Conclusion: READY_FOR_CE_2_3C
Evidence: docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
Evidence commit: 3071e57320b084800764f4529f225233abf354df
Verifier: APPROVE
Owner: ACCEPTED
CE-2.3C: AUTHORIZED
STOP_ACTIVE_DOUBLE_COUNT_RISK: fortsatt ACTIVE
```

## Preconditions

- CE-2.2 is independently verified and owner-accepted.
- CE-2.3A is accepted or explicitly `NOT_APPLICABLE`.
- Current production API scopes and order-access horizon are
  known.
- Read complete current Shopify Admin client patterns and
  integration-job lease implementation.

## Allowed file

Only:

```text
docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
```

## Required source contract

The reconciliation source is Shopify GraphQL Admin API.

Normal runs must query orders updated inside a bounded overlap
window using:

```text
updated_at:>=<window-start>
```

Purchase candidates must additionally satisfy the ADR-approved
paid-state semantics.

Refund candidates are obtained from the updated order's refund
records. One Shopify refund legacy ID maps to one deterministic
canonical refund event.

Do not reconstruct refund settlement from webhook ordering.
Preserve `refund created` semantics unless the ADR explicitly
approved a different event.

## Required GraphQL design

The evidence file must contain the exact GraphQL query, variables
and selected fields required by the current mappers.

At minimum prove coverage for:

### Purchase

```text
order legacy ID
processedAt / createdAt / updatedAt
displayFinancialStatus
currency/presentment currency
totals, tax, shipping and discounts
line items and variant/SKU identity
customer/contact identifiers used by approved hashing
landing/referrer/order-status URLs when available
client details / browser IP when provided by Shopify
note attributes carrying attribution/consent
refund IDs for reconciliation
```

### Refund

```text
refund legacy ID
order legacy ID
createdAt / updatedAt / processedAt
total refunded money
refund line items
transactions and transaction status
currency
```

The design must state exactly which fields are unavailable
through GraphQL and how the mapper handles them without
fabrication.

## Required window and pagination model

Define:

```text
normal lookback: 30 minutes
normal cadence candidate: 10 minutes
initial reconciliation lookback: bounded and owner-approved
page size: maximum supported safe value proven against query cost
pagination: cursor until hasNextPage=false
```

The accepted implementation may adjust these values only with
evidence. The overlap must be greater than cadence.

Normal cron must never scan all historical orders.

For history older than the normal window, use CE-2.6, not
reconciliation.

## Required idempotency model

Reconciliation must call the existing canonical acceptance
pipeline:

```text
Shopify object
→ current mapper
→ deterministic canonical event_id
→ current normalization/planning
→ atomic ledger + provider attempts
```

It must not:

- insert ledger/attempt rows directly;
- create a second queue;
- generate a new event ID;
- bypass consent/attribution;
- send directly to providers;
- mark provider success;
- mutate Shopify.

Overlapping windows and repeated pages must be safe through
deterministic event identity and ledger/provider idempotency.

## Required lease model

Reuse:

```text
ops.integration_job_leases
```

and the established claim/release pattern.

Use one source-level job name:

```text
shopify_commerce_reconciliation
```

Do not create purchase- and refund-specific cron locks.

Define:

- lease duration;
- owner token;
- stale lease reclaim;
- release behavior;
- crash behavior;
- what happens when Postgres is unavailable;
- no overlap between manual and cron runs.

## Required runtime surface

The design must choose exact local paths after reading the
current repository.

Recommended shape, to be confirmed or corrected:

```text
src/lib/analytics/server/shopifyCommerceReconciliationTypes.ts
src/lib/analytics/server/fetchUpdatedShopifyCommerce.ts
src/lib/analytics/server/runShopifyCommerceReconciliation.ts
src/lib/analytics/server/runShopifyCommerceReconciliation.test.ts
src/lib/analytics/server/claimShopifyCommerceReconciliationLease.ts
src/lib/analytics/server/releaseShopifyCommerceReconciliationLease.ts
src/app/api/cron/shopify-commerce-reconciliation/route.ts
src/app/api/cron/shopify-commerce-reconciliation/route.test.ts
vercel.json
```

The evidence file must output an exact allowlist with no globs
for CE-2.3C.

## Required observability

Define a PII-free result:

```ts
type ShopifyCommerceReconciliationSummary = {
  windowStart: string
  windowEnd: string
  pages: number
  ordersExamined: number
  purchaseCandidates: number
  purchasesAccepted: number
  purchasesDuplicate: number
  refundCandidates: number
  refundsAccepted: number
  refundsDuplicate: number
  failures: Array<{
    resourceType: 'order' | 'refund'
    resourceIdHash: string
    reason: string
  }>
}
```

Do not log order names, emails, phones, IPs, URLs, raw payloads
or provider data.

## Required failure semantics

Classify:

```text
lease_blocked
shopify_auth
shopify_scope
shopify_rate_limited
shopify_graphql
shopify_user_error
mapping_invalid
canonical_acceptance
postgres_unavailable
partial_page_failure
```

A failed page must not advance an implicit cursor or be reported
as complete.

## Required conclusion

Return:

```text
READY_FOR_CE_2_3C
READY_WITH_BLOCKERS
STOP_SCOPE_OR_API_ACCESS
STOP_CONTRACT_CONFLICT
STOP_REQUIRES_SCHEMA_CHANGE
```

## Validation and commit

```bash
pnpm exec prettier --check \
  docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
git diff --check
git add \
  docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
git commit -m "docs(analytics): design Shopify commerce reconciliation"
```

No runtime/external mutation. Stop after fresh verifier and owner
acceptance.
