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
```

## Preconditions

- CE-2.2B (ADR-0006 / DEC-012) documents
  `SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION`.
- Owner manually created both Admin notification webhooks
  (mutation already done outside agent).
- This task is **read-only verification** after that mutation.
- Final CE-2.3A owner ACCEPTED requires CE-2.2B/DEC-012 ACCEPTED
  plus evidence verifier APPROVE.

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

## Posture

```text
GraphQL webhookSubscriptionCreate/Update: FORBIDDEN
Mode A (toml/deploy): NOT_APPLICABLE
Mode B GraphQL create: FORBIDDEN
Agent Shopify/env mutation: NONE
```

## Verification result (2026-07-21)

Evidence:

```text
docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
```

```text
Owner conclusion:
SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
```

Summary:

- Owner-attested: one Order payment + one Refund create notification
  webhook, JSON, API 2026-04, same signing secret.
- Production routes deployed; unsigned POST → 401.
- HMAC: raw body + `SHOPIFY_WEBHOOK_SECRET` + `X-Shopify-Hmac-Sha256`.
- orders/paid live-compatible; deterministic purchase ID matched;
  atomic ledger + provider attempts; cron `server_retry` only.
- refunds/create schema incompatible with 2026-04 sample
  (`subtotal` number; `currency` null) → payload blocker.
- Handler/mapper tests: 17/17 pass.
- No refund ledger rows yet.

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

(`STOP_2026_04_PAYLOAD_INCOMPATIBLE` would apply if subscriptions
themselves were unproven; here destinations are attested and purchase
is live — blocker is refund payload schema.)

## Active risk (unchanged)

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

## Commit / stop

Evidence + docs commit only. Fresh verifier. Stop.

Do not auto-start CE-2.3B. Do not treat CE-2.3A as ACCEPTED until
CE-2.2B/DEC-012 is ACCEPTED and verifier APPROVEs.
