# CE-2.3A — Establish the selected Shopify webhook subscriptions

```text
Charter-version: 1.0.0
Roadmap: CE-2.3
Affected invariants: INV-002, INV-003, INV-016, INV-018, INV-019, INV-020, INV-021, INV-022
Goal: establish exactly the webhook subscriptions approved by CE-2.2 / CE-2.2A
Non-goals: reconciliation, purchase/refund cutover, provider changes, replay, deploy storefront code
Primary role: canonical-event-implementer
Supporting role: canonical-event-evidence-auditor, read-only before/after mutation
```

## Preconditions

- CE-2.2 and CE-2.2A (ADR-0006 / DEC-010 amended by DEC-011) are
  independently verified and owner-accepted.
- ADR selects `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION` for
  purchase and refund.
- Exact Shopify app, shop, access scopes, API version, topic and
  destination are recorded.
- Explicit owner approval for Shopify mutation is present in the
  task handoff (**separate** from CE-2.2A ACCEPTED).
- Use one writer. A verifier remains read-only.
- Stop if the ADR selects `RECONCILIATION_ONLY` for both events;
  return `NOT_APPLICABLE` with no commit.

## Approved subscription set

Create only subscriptions approved by the ADR:

```text
ORDERS_PAID     → /api/shopify/webhooks/orders-paid
REFUNDS_CREATE  → /api/shopify/webhooks/refunds-create
```

Do not subscribe to adjacent order topics “for completeness”.

## Implementation mode

Run exactly one mode. For the current production app (custom
Admin app **Utekos Storefront** on `erling-7921.myshopify.com`):

```text
Mode A: NOT_APPLICABLE
Mode B: REQUIRED
```

### Mode A — App-specific subscriptions

```text
NOT_APPLICABLE
```

Do **not** create or require:

```text
shopify.app.toml
shopify app config link
shopify app deploy
```

A custom Admin-created app cannot manage these subscriptions via
Partner/CLI app config release. If a future ADR selects
`APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION` for a different app
class, reopen Mode A under a new task — not this one.

### Mode B — Shop-specific subscriptions

Use this mode when the ADR says:

```text
SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
```

Allowed files:

```text
scripts/shopify/ensure-canonical-commerce-webhooks.mjs
scripts/shopify/ensure-canonical-commerce-webhooks.test.mjs
package.json
```

The script must:

- read existing production env names without printing values;
- query all shop-specific subscriptions with pagination;
- compare topic, URI and format;
- default to dry-run;
- produce a deterministic plan;
- create missing approved subscriptions;
- update a wrong URI only with explicit approval;
- never delete an unknown subscription automatically;
- reject duplicate approved-topic subscriptions;
- fail on GraphQL `userErrors`;
- write no credentials or payloads;
- support `--json`;
- require both `--apply` and
  `SHOPIFY_WEBHOOK_MUTATION_APPROVED=1` for mutation.

Add:

```json
{
  "shopify:webhooks:plan": "node scripts/shopify/ensure-canonical-commerce-webhooks.mjs",
  "shopify:webhooks:apply": "node scripts/shopify/ensure-canonical-commerce-webhooks.mjs --apply"
}
```

The implementation must use GraphQL Admin API
`webhookSubscriptionCreate` / `webhookSubscriptionUpdate` and the
API version approved by the ADR / observed
`app.webhookApiVersion` after identity verification.

## Required pre-mutation identity verification

Before any plan/apply that can mutate, run read-only:

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

using the runtime `SHOPIFY_ADMIN_API_TOKEN`.

Required match:

```text
app.title = Utekos Storefront
shop.myshopifyDomain = erling-7921.myshopify.com
```

If the token identifies a different app or shop, stop:

```text
STOP_WRONG_APP_OR_SHOP
```

Do not print secrets, full tokens, or unnecessary PII.

## Required pre-mutation evidence

Record:

- identity query result (sanitized; no secrets);
- current subscription inventory;
- exact proposed create/update operations;
- app/shop identity;
- API version;
- destination hosts/paths;
- access scopes;
- rollback operation;
- owner approval reference for mutation.

## Required mutation proof

After approved mutation:

- verify subscription through `webhookSubscriptions`;
- trigger a Shopify test delivery (not a real paid/refund
  production order merely to test);
- verify HMAC handling and 2xx response;
- verify headers include API version, webhook ID and event ID;
- verify no provider send or replay is triggered by the test
  unless explicitly using a non-production fixture environment.

## Required conclusion

Return:

```text
SUBSCRIPTIONS_ESTABLISHED
SUBSCRIPTIONS_ALREADY_CORRECT
NOT_APPLICABLE
STOP_DUPLICATE_SUBSCRIPTIONS
STOP_WRONG_APP_OR_SHOP
STOP_SCOPE_OR_AUTH
STOP_MUTATION_NOT_APPROVED
```

Mode A must not be selected for this production app.

## Verification

Mode B only:

```bash
node --test \
  scripts/shopify/ensure-canonical-commerce-webhooks.test.mjs
node --check \
  scripts/shopify/ensure-canonical-commerce-webhooks.mjs
pnpm exec tsc --noEmit
git diff --check
```

Then run the existing analytics/webhook tests and build.

## Commit

Mode B:

```bash
git add \
  scripts/shopify/ensure-canonical-commerce-webhooks.mjs \
  scripts/shopify/ensure-canonical-commerce-webhooks.test.mjs \
  package.json
git commit -m "feat(shopify): manage canonical commerce webhooks"
```

No storefront push/deploy. Shopify mutation remains a separately
approved action after the script commit is verified. Do not start
Mode B mutation automatically after CE-2.2A ACCEPTED. Stop after
fresh verifier and owner acceptance of the script commit, then
await explicit mutation approval.
