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
→ pass (includes missing-taxable default)

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes AddToWishlist + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production tip | **READY** — `22527d290` (taxable default) on `utekos.no`; wiring commit `5a2d6222c` |
| dataLayer `add_to_wishlist` after WishlistButton click | **PASS** — `a35b85a9-f88b-49c0-90e9-071abc361c6e` |
| `POST /api/events/add-to-wishlist` | **PASS** — HTTP `202` |
| Persist-before-emit | **PASS** — `utekos_wishlist_v1` mutation `d496c875-afa6-4256-a361-4a9f36e87c70` |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **127** | Meta Pixel add_to_wishlist AddToWishlist - 2026-07-24 | Tag **153** HTML (`add_to_wishlist`→`AddToWishlist` + commerce); trigger **152** regex includes `add_to_wishlist`; `supportDocumentWrite` boolean; install-race + isoCurrency retained. Source SHA-256 `712a1faadce07d1e6adf2ee632616d7633f41f4a85b6d63abd1f0cf1397b1668`. |

### Meta Pixel `AddToWishlist` browser parity

| Gate | Status |
|------|--------|
| `window.fbq` + tag 153 initialized | **PASS** |
| Shared `event_id` Pixel↔dataLayer | **PASS** — `__utekosMetaPixelState.sent['AddToWishlist:a35b85a9-f88b-49c0-90e9-071abc361c6e']` |
| OpenBridge / Meta network | OpenBridge `mpc2` posts observed; `/tr` PageView present |

### Follow-up fix in same queue item

List/overview variants omit GraphQL `taxable` → Zod reject after persist. Fixed in `22527d290` by defaulting `taxable: true` in `mapShopifyAddToWishlist`.

## Hard stop

Do not auto-continue to queue #3 (`view_cart`).

## Hard stop

Do not auto-continue to queue #3 (`view_cart`).
