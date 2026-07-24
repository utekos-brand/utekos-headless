# Evidence: remove_from_cart Shopify `carts/update` webhook

**Date:** 2026-07-24  
**Start SHA:** `4fe732abdccb7844798ef2c4f5e248e10972ce50`  
**API version:** Shopify webhook / Admin REST **`2026-07`**  
**Roadmap:** Stale-events queue #4 follow-on (server webhook source)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: remove_from_cart server webhook (carts/update) after browser Pixel path LIVE
Affected invariants: one semantic removal → one deterministic event_id; HMAC fail-closed; snapshot-only carts/update never invents removals without prior state; Meta CAPI remains matrix `-`
Goal: implement POST /api/shopify/webhooks/remove-from-cart for topic carts/update with Redis prior snapshot diff → canonical remove_from_cart
Non-goals: scroll_depth; Meta CAPI; changing browser CartLineItem Pixel path
Allowed files: webhook route/handler, cart snapshot/diff/mapper, remove_from_cart source enum, tests, this evidence
Documentation status: Shopify MCP Admin 2026-07 carts/update + HMAC docs verified; sibling orders-paid/refunds-create patterns reused
```

## Shopify docs grounding (2026-07)

| Claim | Source |
|-------|--------|
| Topic `carts/update` payload is cart snapshot (`id`/`token`, `line_items[]` with money sets, `updated_at`) | [Admin REST webhook 2026-07](https://shopify.dev/docs/api/admin-rest/2026-07/resources/webhook) via Shopify Dev MCP |
| HMAC = base64(HMAC-SHA256(raw_body, shared_secret)); header `X-Shopify-Hmac-SHA256`; constant-time compare | [Verify webhook deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries) |
| **Limitation:** `carts/update` occurs for online-store cart updates; **custom/headless storefront carts are not supported** by this topic | Same webhook topic description |

Admin registration (user):  
`https://utekos.no/api/shopify/webhooks/remove-from-cart` → topic `carts/update`, API version `2026-07`.

## Design

1. **HMAC** via existing `verifyShopifyWebhook` (`SHOPIFY_WEBHOOK_SECRET`).
2. **Zod** validate against 2026-07 `carts/update` shape (`shopifyCartsUpdateWebhookPayload.ts`).
3. **Prior state:** Redis key `analytics:shopify_cart_snapshot:v1:{token}`, TTL 14d. First delivery for a token → `prior_cart_missing`, store snapshot, **emit nothing**.
4. **Diff:** aggregate quantities by `variant_id`. Decrease / missing line → removal; increase → ignore for this event; identical → noop.
5. **Canonical:** `source:'webhook'`, deterministic `event_id` from `cartToken|variantId|qtyRemoved|updatedAt`, rich commerce (NOK tax context), `cart_mutation_id` via `createCartMutationId` + `cartUpdatedAt`.
6. **Providers (matrix):** Google DM outbox planned only when consent/client_id qualify (default webhook consent denied → no Google fire until enrichment). Meta CAPI = `-` (no outbox). MS-S blocked. Browser Pixel remains separate LIVE path.
7. **Dedupe:** webhook retries share deterministic `event_id` → ledger duplicate. Browser still uses random UUID today → document SoT split: Pixel/browser for Meta Pixel; webhook for server ledger when online-store carts fire. No Meta CAPI double-count (matrix `-`).

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/server/diffShopifyCartSnapshots.test.ts \
  src/lib/analytics/server/shopifyCartRemovalToCanonicalRemoveFromCart.test.ts \
  src/lib/analytics/server/handleShopifyCartsUpdateRemoveFromCartWebhook.test.ts \
  src/lib/analytics/removeFromCartEvent.test.ts
```

Covered cases: qty decrease → remove; qty increase → no remove; identical → noop; missing prior → fail-closed store-only; missing line → full prior qty; invalid HMAC → 401.

## Smoke

| Gate | Status |
|------|--------|
| Local signed payload / unit HMAC path | Covered in handler tests (`verifyWebhook` seam) |
| Live Shopify Admin delivery to production | Pending deploy + online-store cart mutation (headless Storefront API carts may never hit this topic per Shopify docs) |
| Meta CAPI | N/A (matrix `-`) |

## Hard stop

Do not auto-continue to `scroll_depth`.
