# CE-2.3A — Notification webhook post-mutation verification

```text
Charter-version: 1.0.0
Roadmap: CE-2.3A
Affected invariants: INV-002, INV-003, INV-016, INV-018, INV-019, INV-020, INV-021, INV-022
Goal: read-only verify owner-created Admin notification webhooks for
  Order payment + Refund create against production routes, HMAC,
  2026-04 payload compatibility, ledger/outbox, and tests
Non-goals: Shopify/Admin mutation, GraphQL webhookSubscriptionCreate/
  Update, shopify.app.toml, shopify app deploy, Vercel env change,
  forged HMAC, manual provider send, replay/backfill, push/deploy,
  final owner ACCEPTED of CE-2.3A
Primary role: canonical-event-evidence-auditor (read-only)
Owner conclusion: SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
```

## Governance snapshot

| Field | Value |
| --- | --- |
| Owner authorization | Read-only post-mutation verification after owner manual Admin creates |
| Evidence HEAD before write | `6d60c8e4c5cc5edf164b4de691f05907defa42e2` |
| Parent governance | CE-2.2B / DEC-012 (`SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION`) |
| Production deploy | `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` @ `0a800b1ae169eab8af12c21b3595fe99a667d54c` READY |
| Mutations by agent | none (docs/evidence only) |
| Secrets / full HMAC / PII | none retained; secret documented as fingerprint only |

### Preflight

```text
Charter-version: 1.0.0
Roadmap task: CE-2.3A
Affected invariants: INV-002, INV-003, INV-016, INV-018–INV-022
Goal: post-mutation verification of Admin notification webhooks
Non-goals: any Shopify/env/runtime mutation; ACCEPTED without docs align
Allowed files/systems: evidence + task/handoff/program-state docs;
  read-only Shopify/Vercel/Supabase/repo
Start SHA: 6d60c8e4c5cc5edf164b4de691f05907defa42e2
Documentation status: CE-2.2B corrected owner model; CE-2.3A ACCEPTED
  still blocked until CE-2.2B/DEC-012 owner ACCEPTED + this evidence
  verifier APPROVE
```

---

## Owner attestation (Admin UI — not agent-visible)

Owner stated both notification webhooks were created manually:

```text
Order payment → https://utekos.no/api/shopify/webhooks/orders-paid
Refund create → https://utekos.no/api/shopify/webhooks/refunds-create
Format: JSON
Webhook API version: 2026-04
Signing: same shop-level notification secret → SHOPIFY_WEBHOOK_SECRET
```

Agent cannot open Shopify Admin Notifications UI. Exact-one-active
subscription per event is therefore **OWNER_ATTESTED**, corroborated by:

- empty Admin API `webhookSubscriptions` is expected for notification
  webhooks (CE-2.2B) and must not be read as “absent”;
- no GraphQL create/update performed in this task;
- live purchase acceptances continue via `payload.source=webhook`.

---

## Claim register

### Claim 1 — Production routes deployed and fail-closed without HMAC

```text
Status: VERIFIED
Evidence: POST https://utekos.no/api/shopify/webhooks/orders-paid
  and .../refunds-create with body {} → HTTP 401
  {"error":"invalid_webhook_signature"}
Vercel group_by requestPath (2d, deployment dpl_ETtm…):
  /api/shopify/webhooks/orders-paid count≥2
  /api/shopify/webhooks/refunds-create count≥1
Limitation: probe requests are unsigned; prove route+HMAC gate only
```

### Claim 2 — HMAC contract uses raw body + SHOPIFY_WEBHOOK_SECRET only

```text
Status: VERIFIED (repository)
Files:
  src/app/api/shopify/webhooks/orders-paid/route.ts (thin POST)
  src/app/api/shopify/webhooks/refunds-create/route.ts (thin POST)
  src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts
  src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts
  src/lib/shopify/verifyShopifyWebhook.ts → verifyWebhook.ts
Behavior:
  request.text() before JSON.parse
  x-shopify-hmac-sha256 header
  process.env.SHOPIFY_WEBHOOK_SECRET only
  timingSafeEqual; missing/wrong → 401; no accept path
  no parallel Utekos Storefront API secret in verify path
Secret fingerprint (sha256 hex prefix, not value):
  local SHOPIFY_WEBHOOK_SECRET → 8a75081095f1 (len=64)
  prior session: local↔Vercel production fingerprint match=true
```

### Claim 3 — Handler unit + mapper tests

```text
Status: VERIFIED
Command: pnpm exec tsx --test
  handleShopifyOrdersPaidWebhook.test.ts
  handleShopifyRefundsCreateWebhook.test.ts
  shopifyOrderToCanonicalPurchase.test.ts
Result: 17/17 pass (HMAC 401, duplicate 200, accept 202)
```

### Claim 4 — orders/paid vs OrderPaid / purchase mapper (2026-04)

```text
Status: VERIFIED compatible (docs sample + live accept)
Shopify Webhooks 2026-04 orders/paid sample:
  money fields as strings (e.g. current_total_price="414.95")
  id numeric; created_at ISO string; currency string
Live: ledger event_id 269192f3-98e2-4407-9eb7-6bf812f555ba
  txn shopify_order_6968683004152
  deterministicPurchaseEventId("6968683004152") === event_id (MATCH)
  payload.source=webhook
  created_at 2026-07-21T12:37:15.247Z
  ops.provider_dispatch_attempts ×3 same created_at (atomic plan)
  dispatch_mode=server_retry (no request-path provider dispatch)
  duplicate event_id rows = 0 for this id
```

### Claim 5 — refunds/create vs shopifyRefundWebhookSchema (2026-04)

```text
Status: VERIFIED INCOMPATIBLE (payload blocker)
Official sample https://shopify.dev/docs/api/webhooks/2026-04
  refunds/create:
  refund_line_items[].subtotal = number (e.g. 89.99) — 5/5 numeric
  transactions[].amount = string (e.g. "75.00")
  transactions[].currency = null in sample
Repo schema shopifyRefundWebhookPayload.ts:
  subtotal: z.string() → rejects number
    (safeParse number subtotal = false)
  currency: z.string().regex(...).optional() → rejects null
Mapper also requires a non-empty transaction currency or throws
Live: marketing.event_ledger refund count = 0
  (no successful refund accept yet; no duplicate/idempotency proof)
```

### Claim 6 — Request-path provider isolation

```text
Status: VERIFIED (code + attempt shape)
acceptCanonicalPurchase / acceptCanonicalRefund only
  store.accept + planCanonicalEventDispatch
No runRegisteredProviderOutboxBatch in webhook handlers
Attempts are server_retry (cron owns dispatch)
```

### Claim 7 — Shopify test delivery / passive live evidence

```text
Status: PARTIAL
orders-paid: passive live delivery proven via ledger+attempts
  (Claim 4); unsigned probe 401 only in recent Vercel JSON window
refunds-create: no ledger row; Admin test delivery not executed
  by agent (no Admin UI; no forged HMAC; no economic side effect)
Shopify headers on 2xx: inferred from successful HMAC-gated accept;
  not re-copied from Vercel log pages (timeout/noise)
```

### Claim 8 — No agent Shopify/env mutation

```text
Status: VERIFIED
No webhookSubscriptionCreate/Update
No shopify.app.toml / shopify app deploy
No Vercel env write
No HMAC forge / provider send / replay
```

---

## Conclusion

```text
SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
```

Both Admin notification destinations are owner-attested, production
routes respond, HMAC secret contract matches fingerprint `8a75081095f1`,
orders/paid is live-compatible and ledger-proven, but refunds/create
Zod contract is incompatible with Webhook API 2026-04 sample money/
currency typing. Fix belongs to a later approved code task — not CE-2.3A.

### Blocked for final CE-2.3A ACCEPTED

```text
CE-2.2B / DEC-012 owner ACCEPTED
This evidence verifier APPROVE
Refund payload schema remediation (separate task) before claiming
  full refund live acceptance
```

### Active interlock unchanged

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```
