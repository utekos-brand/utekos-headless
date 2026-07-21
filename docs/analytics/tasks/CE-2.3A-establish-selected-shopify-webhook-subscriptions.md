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
Status: ACCEPTED
Technical conclusion: SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
F1 conclusion: REFUND_2026_04_COMPATIBILITY_FIXED
```

## Acceptance (2026-07-21)

- CE-2.2B / DEC-012 ACCEPTED (commit `b445e9f8c`)
- CE-2.3A governance ACCEPTED with payload blocker
- Evidence:
  `docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md`
  (commit `0787af63a`; verifier APPROVE)

## CE-2.3A-F1 acceptance (2026-07-21)

```text
CE-2.3A-F1: ACCEPTED
Conclusion: REFUND_2026_04_COMPATIBILITY_FIXED
Accepted runtime SHA: 59c130c2e
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE: CLOSED
STOP_ACTIVE_DOUBLE_COUNT_RISK: fortsatt ACTIVE
```

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

## Verified

```text
orders/paid: active + production-proven
refunds/create: active subscription
both: JSON + Webhook API 2026-04 + same SHOPIFY_WEBHOOK_SECRET
HMAC contract correct (raw body + SHOPIFY_WEBHOOK_SECRET)
no request-path provider dispatch
purchase: deterministic canonical ID + atomic ledger/outbox
tests: 17/17 pass
```

## Active blockers

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Closed:

```text
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
```

## Stop

CE-2.3A-F1 ACCEPTED. CE-2.3B is next authorized task. Do not
auto-start CE-2.3C without CE-2.3B owner acceptance.
