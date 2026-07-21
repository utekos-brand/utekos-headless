# CE-2.3A — Establish / verify Shopify commerce notification webhooks

```text
Charter-version: 1.0.0
Roadmap: CE-2.3
Affected invariants: INV-002, INV-003, INV-016, INV-018, INV-019, INV-020, INV-021, INV-022
Goal: verify the live Admin notification Order payment webhook and
  plan (not auto-create) Refund create — per CE-2.2B / DEC-012
Non-goals: GraphQL webhookSubscriptionCreate for these topics,
  reconciliation implementation, purchase/refund cutover, replay,
  deploy storefront code, automatic refund webhook creation
Primary role: canonical-event-implementer
Supporting role: canonical-event-evidence-auditor, read-only
```

## Preconditions

- CE-2.2B (ADR-0006 / DEC-012) is independently verified and
  owner-accepted.
- ADR selects
  `SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION` for
  purchase and refund.
- Explicit owner approval is required before **any** Shopify
  Admin UI change (including creating Refund create
  notification).
- Use one writer. A verifier remains read-only.

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
```

Do not replace `SHOPIFY_WEBHOOK_SECRET` with the custom app API
secret key.

## Implementation posture (CE-2.2B)

```text
existing orders-paid:
  VERIFY ONLY — already active — no creation

refunds-create:
  PLAN manual Shopify Admin creation only
  (separate explicit owner approval before UI change)

GraphQL webhookSubscriptionCreate / webhookSubscriptionUpdate
  for ORDERS_PAID and REFUNDS_CREATE:
  FORBIDDEN under this owner model

Mode A (shopify.app.toml / shopify app deploy):
  NOT_APPLICABLE

Mode B (Admin API subscription create for these topics):
  FORBIDDEN
```

## Why GraphQL inventory stays empty

Admin notification webhooks are shop-attached and are **not**
returned by `webhookSubscriptions`. Empty GraphQL/REST webhook
lists must not be treated as proof that `orders-paid` is absent.

## Utekos Storefront Admin API token — allowed uses

```text
read-only identity control
Shopify reconciliation (later tasks)
future Admin API operations under separate approval
```

Forbidden for this task:

```text
creating ORDERS_PAID / REFUNDS_CREATE via webhookSubscriptionCreate
claiming the notification webhook is “owned” by the custom app
replacing SHOPIFY_WEBHOOK_SECRET with the app API secret
```

## Required evidence for orders-paid (verify only)

Record (sanitized; no secrets/PII dumps):

- Admin UI confirmation: Notifications → Webhooks → Order payment
  → destination host/path match production route;
- format JSON;
- HMAC path uses `SHOPIFY_WEBHOOK_SECRET`;
- recent Vercel/runtime evidence of 2xx `orders-paid` (may cite
  CE-2.1);
- confirmation that no GraphQL create/update was performed;
- confirmation that no duplicate destination was added.

Optional read-only Admin identity query (does **not** prove
notification ownership):

```graphql
query CanonicalProductionAppIdentity {
  app {
    id
    apiKey
    title
    handle
    webhookApiVersion
  }
  currentAppInstallation {
    id
    accessScopes {
      handle
    }
  }
  shop {
    id
    name
    myshopifyDomain
  }
}
```

Expected shop domain when using the Storefront Admin token:

```text
shop.myshopifyDomain = erling-7921.myshopify.com
app.title = Utekos Storefront
```

Mismatch → `STOP_WRONG_APP_OR_SHOP` for token-scoped work only;
it does not authorize creating GraphQL webhooks.

## Required plan for refunds-create (no auto-create)

Document a manual Admin UI plan:

```text
Event: Refund create (or exact Admin label matching refunds/create)
URI: https://utekos.no/api/shopify/webhooks/refunds-create
Format: JSON
Signing: same shop notification secret / SHOPIFY_WEBHOOK_SECRET
```

Do **not** create it in this task. Stop after the plan is
committed/evidenced and await separate owner mutation approval.

## Required conclusions

```text
ORDERS_PAID_VERIFIED
REFUNDS_CREATE_PLAN_READY
STOP_DUPLICATE_SUBSCRIPTIONS
STOP_GRAPHQL_CREATE_FORBIDDEN
STOP_MUTATION_NOT_APPROVED
STOP_WRONG_APP_OR_SHOP
```

## Active risk (unchanged)

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
```

## Allowed files for CE-2.3A evidence/docs follow-on

Exact allowlist is set when CE-2.3A is authorized after CE-2.2B
ACCEPTED. This task file itself is governance only under CE-2.2B.

Do not add
`scripts/shopify/ensure-canonical-commerce-webhooks.mjs` for
ORDERS_PAID/REFUNDS_CREATE under the notification-webhook owner
model.

## Commit / stop

CE-2.2B only updates governance docs. CE-2.3A execution starts
only after CE-2.2B ACCEPTED and a separate start order.

No Shopify mutation in CE-2.2B. Do not auto-create the refund
notification webhook.
