# Evidence: add_to_wishlist UI + store wiring (queue #2)

**Date:** 2026-07-24  
**Start SHA:** `a9b42e1c3cbcb7eb79c5f59364f0a46ab2b13289`  
**Roadmap:** Stale-events design queue #2 (`add_to_wishlist`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #2 add_to_wishlist (design 2026-07-24)
Affected invariants: one occurrence → one event_id; emit only after wishlist persist; consent fail-closed; no emit on bare login-dialog click
Goal: minimal localStorage wishlist store + WishlistButton post-mutation emit → dataLayer + /api/events/add-to-wishlist + Meta AddToWishlist Pixel↔CAPI
Non-goals: events 3–11; full customer-account wishlist sync; Checkout UI Extensions
Allowed files: wishlist store, analytics mapper/reporter/helper, WishlistButton + call sites, web-meta-pixel.html, tests, this evidence
Documentation status: design + handoff + existing catalog/API/Meta adapters sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- Minimal `localStorage` wishlist store (`utekos_wishlist_v1`) with idempotent per-variant mutations + `wishlist_mutation_id`.
- `mapShopifyAddToWishlist` reuses view_item commerce mapping.
- `reportCanonicalAddToWishlist` accepts Shopify product/variant + mutation id.
- `persistAndReportAddToWishlist` persists first, emits only on new mutation.
- `WishlistButton` no longer treats login-dialog open as the primary action; heart click persists then emits; optional sync dialog does not emit.
- Call sites: `ProductCard`, `HelpChooseCard`, PDP `ProductHeader`/`ProductPageView`.
- GTM template: `add_to_wishlist` → `AddToWishlist` + commerce payload (isoCurrency fail-closed retained; install-race fix retained).
- Catalog/API/Meta CAPI/Google DM adapters were already registered; unchanged.

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/wishlist/wishlistStore.test.ts \
  src/lib/analytics/addToWishlistEvent.test.ts \
  src/lib/analytics/shopifyAddToWishlistCommerce.test.ts \
  src/lib/analytics/persistAndReportAddToWishlist.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes AddToWishlist + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

## Live / production gates

(pending after commit/push + GTM publish + smoke)

## Hard stop

Do not auto-continue to queue #3 (`view_cart`).
