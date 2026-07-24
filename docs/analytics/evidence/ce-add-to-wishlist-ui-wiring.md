# Evidence: add_to_wishlist UI + store wiring (queue #2)

**Date:** 2026-07-24  
**Start SHA:** `a9b42e1c3cbcb7eb79c5f59364f0a46ab2b13289`  
**Roadmap:** Stale-events design queue #2 (`add_to_wishlist`)  
**Tip at Meta EM investigation:** `bab92a3ef3d54ce808f9c24802fcca74568eee8f`

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #2 add_to_wishlist (design 2026-07-24)
Affected invariants: one occurrence → one event_id; emit only after wishlist persist; consent fail-closed; no emit on bare login-dialog click
Goal: minimal localStorage wishlist store + WishlistButton post-mutation emit → dataLayer + /api/events/add-to-wishlist + Meta AddToWishlist Pixel↔CAPI
Non-goals: events 3–11; full customer-account wishlist sync; Checkout UI Extensions; view_cart (#3)
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
| Production tip | **READY** — tip includes wishlist wiring; investigated at `bab92a3ef` |
| dataLayer `add_to_wishlist` after WishlistButton click | **PASS** — fresh `95e3da94-55d8-41a2-b996-d00a0e5e2cc1` (earlier `a35b85a9-…`) |
| `POST /api/events/add-to-wishlist` | **PASS** — body shares `event_id` (HTTP 202 on prior smoke) |
| Persist-before-emit | **PASS** — `utekos_wishlist_v1` mutation before emit |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **127** (live) | Meta Pixel add_to_wishlist AddToWishlist - 2026-07-24 | Tag **153** HTML (`add_to_wishlist`→`AddToWishlist` + commerce); trigger **152** regex includes `add_to_wishlist`. Pixel ID `1092362672918571`. Source SHA-256 `712a1faadce07d1e6adf2ee632616d7633f41f4a85b6d63abd1f0cf1397b1668`. |

### Meta standard event spelling (docs)

Meta Pixel reference standard event is exactly **`AddToWishlist`** (not `AddToWishList`).  
Source: https://developers.facebook.com/docs/meta-pixel/reference — Context7 `/websites/developers_facebook_meta-pixel_reference`.

Our Pixel map + CAPI mapper both use `AddToWishlist`. Searching Events Manager for `AddToWishList` will miss the standard event.

### Meta Pixel / OpenBridge browser parity (corrected)

Earlier note that only `/tr` PageView was seen was **incomplete**: `/tr` posts as multipart body (`ev`/`eid` not always in query string).

Fresh smoke on `/produkter/utekos-stapper` with marketing consent (`/tmp/wishlist-meta-smoke.json`):

| Gate | Status |
|------|--------|
| dataLayer | **PASS** — `add_to_wishlist` / `95e3da94-55d8-41a2-b996-d00a0e5e2cc1` |
| Pixel `/tr` | **PASS** — `ev=AddToWishlist`, `eid=95e3da94-…`, `cd[content_ids]=["42903954292984"]`, `currency=NOK`, `value=199`, HTTP 200 |
| OpenBridge | **PASS** — `event_name=AddToWishlist`, same `event_id`, HTTP 200 |
| Shared `event_id` | **PASS** — dataLayer = `/tr` eid = OpenBridge = first-party body |

### Meta CAPI (not Pixel-only)

| Gate | Status |
|------|--------|
| Registry | **PASS** — `meta:add_to_wishlist` → `mapCanonicalAddToWishlistToMeta` → `AddToWishlist` |
| Outbox worker | **PASS** — `providerOutboxWorkerRegistry` includes `meta:add_to_wishlist` |
| Sample accepted | **PASS** — `95e3da94-…` → `accepted_unverified`, `eventsReceived=1`, `fbTraceId=AuARiKqa5-NmDr09uq-_NP0` (after cron drain) |
| Earlier samples | `a35b85a9-…` / `cae7369b-…` / `5e4395c4-…` also `accepted_unverified` with `eventsReceived=1` |

CAPI is **queued** (`server_retry`) until `/api/cron/provider-outbox-dispatch` runs (~5 min). Rows briefly stay `pending` before acceptance — not missing mapper.

### Meta Events Manager visibility — honest gate

| Gate | Status |
|------|--------|
| Graph Pixel `/stats` (14d + last 12h) | **NO-GO for EM proof** — aggregated counts include `AddToCart`, `InitiateCheckout`, `ViewContent`, custom `SelectItem`, etc., but **zero** `AddToWishlist` / `AddToWishList` at capture time (lag possible; feature first emitted ~2026-07-23T23:56Z) |
| Browser `/tr` + OpenBridge + CAPI accept | **PASS** (stack) |
| Events Manager Overview / Test Events UI | **blocked_verification** — no dashboard screenshot; do **not** claim EM-visible from browser/`eventsReceived` alone |

**Conclusion for EM report «Ingen AddToWishList…»:**

1. Wrong search spelling (`AddToWishList` ≠ `AddToWishlist`) is a likely UI miss.
2. Stack is **not** missing CAPI mapper and is **not** sending a non-standard Pixel name.
3. Prior evidence over-claimed EM readiness from local `__utekosMetaPixelState` without `/tr` body parse.
4. Independent EM UI / `/stats` confirmation remains **NO-GO** until Meta Overview/Test Events shows `AddToWishlist` (or `/stats` counts > 0).

```text
STACK_WISHLIST_META_FIRE_PROVEN
EVENTS_MANAGER_VISIBLE_NOT_PROVEN
Fix mapping/GTM republish: NOT REQUIRED (live v127 already maps AddToWishlist)
Do not auto-continue to queue #3 (view_cart)
```

### Follow-up fix in same queue item

List/overview variants omit GraphQL `taxable` → Zod reject after persist. Fixed in `22527d290` by defaulting `taxable: true` in `mapShopifyAddToWishlist`.

## Hard stop

Do not auto-continue to queue #3 (`view_cart`).
