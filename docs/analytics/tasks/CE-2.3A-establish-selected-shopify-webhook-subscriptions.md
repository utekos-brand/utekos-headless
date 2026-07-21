# CE-2.3A — Establish / verify Shopify commerce notification webhooks

```text
Charter-version: 1.0.0
Roadmap: CE-2.3
Affected invariants: INV-002, INV-003, INV-016, INV-018, INV-019, INV-020, INV-021, INV-022
Goal: verify owner-created Admin notification webhooks for
  Order payment + Refund create (post-mutation, read-only)
Non-goals: GraphQL webhookSubscriptionCreate/Update, Mode A toml,
  reconciliation implementation, purchase/refund cutover, replay,
  deploy storefront code, forged HMAC, schema remediation in this task
Primary role: canonical-event-implementer / evidence-auditor
Supporting role: canonical-event-verifier (read-only)
Status: VERIFIED_AWAITING_GOVERNANCE_ACCEPTANCE
```

## Preconditions

- CE-2.2B (ADR-0006 / DEC-012) documents
  `SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION`.
- Owner manually created both Admin notification webhooks
  (mutation already done outside agent).
- Technical verification is complete; governance ACCEPTED waits
  on CE-2.2B / DEC-012 owner ACCEPTED.

## Approved destinations

```text
ORDERS_PAID     → https://utekos.no/api/shopify/webhooks/orders-paid
REFUNDS_CREATE  → https://utekos.no/api/shopify/webhooks/refunds-create
```

Management surface:

```text
Shopify Admin → Settings → Notifications → Webhooks
```

Signing:

```text
Shop-level notification webhook secret
→ runtime SHOPIFY_WEBHOOK_SECRET
fingerprint (sha256 prefix): 8a75081095f1
```

Not owned by:

```text
webhookSubscriptionCreate / webhookSubscriptionUpdate
shopify.app.toml / shopify app deploy
Utekos Storefront Admin API token (reconciliation/identity only)
```

## Posture

```text
GraphQL webhookSubscriptionCreate/Update: FORBIDDEN
Mode A (toml/deploy): NOT_APPLICABLE
Mode B GraphQL create: FORBIDDEN
Agent Shopify/env mutation: NONE
Runtime / refund schema change: NOT in this task
```

## Verification result (2026-07-21)

Evidence:

```text
docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
```

```text
Technical conclusion:
SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER

Governance status:
VERIFIED_AWAITING_GOVERNANCE_ACCEPTANCE
```

Summary:

- Owner-attested: one Order payment + one Refund create
  notification webhook, JSON, API 2026-04, same signing secret.
- Production routes deployed; unsigned POST → 401.
- HMAC: raw body + `SHOPIFY_WEBHOOK_SECRET` +
  `X-Shopify-Hmac-Sha256`.
- `orders-paid`: live and technically verified (deterministic
  purchase ID + atomic attempts).
- `refunds-create`: live subscription; canonical acceptance
  blocked by payload schema vs 2026-04.
- Handler/mapper tests: 17/17 pass.
- No refund ledger rows yet.

## Active blockers

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
```

Refund blocker:

```text
Shopify refunds/create 2026-04:
  subtotal may be number
  currency may be null

Current repository schema:
  subtotal required as string
  currency rejects null
```

## Required conclusions vocabulary

```text
SUBSCRIPTIONS_ESTABLISHED
SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER  ← selected
STOP_DUPLICATE_SUBSCRIPTIONS
STOP_HMAC_CONTRACT_MISMATCH
STOP_2026_04_PAYLOAD_INCOMPATIBLE
STOP_ROUTE_NOT_DEPLOYED
STOP_TEST_DELIVERY_CAUSED_SIDE_EFFECT
```

## Commit / stop

CE-2.2B governance amend only updates this status for alignment.
Do not auto-start CE-2.3B or refund schema fix. Stop for owner
ACCEPTED of DEC-012.
