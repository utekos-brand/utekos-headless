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
| Graph Pixel `/stats` + `event_total_counts` (14d / 24h / 6h / 1h, rechecked 2026-07-24T00:19Z) | **NO-GO for EM proof** — `AddToWishlist` / `AddToWishList` remain **0**. Same window shows `AddToCart`, `InitiateCheckout`, `ViewContent`, `PageView`, `Purchase`, `SelectItem`. |
| Graph `dataset_quality` (no agent filter) | Event names present: `AddToCart`, `InitiateCheckout`, `PageView`, `Purchase`, `SelectItem`, `ViewContent` — **no** `AddToWishlist`. |
| Browser dataLayer + Pixel state + OpenBridge + first-party POST | **PASS** (stack) — fresh live `899d659c-7b18-4bf7-ab69-6b2bbec80a14` (2026-07-24T00:16Z) |
| Meta CAPI accept (`events_received=1`) | **PASS** (stack only) — 6 ledger rows all `accepted_unverified` incl. `899d659c-…` / `95e3da94-…` |
| Production `META_TEST_EVENT_CODE` | **not set** on Vercel production (correct) |
| Direct Graph Test Events CAPI probe | **API accept only** — `TEST46149` + `AddToWishlist` → `events_received=1` (`fd3c0a4c-39fb-454a-aa23-41255a55e9d3`, `fbtrace_id=AGSjxXtIagIZ1Ux9jbVXpxe`). Overview/`/stats` still 0. UI screenshot still blocked. |
| Events Manager Overview UI screenshot | **blocked_verification** — no Meta UI MCP |

**Asset identity (mismatch check):**

| Surface | Value |
|---------|-------|
| Pixel / dataset ID | `1092362672918571` (`Utekos Pixel`) |
| Owner business | `1384717111999921` (`Utekos Marketing Data Layer`) |
| Shared agency | `538548380599665` (`Utekos Marketing Group`) |
| OpenBridge | `mpc2-prod-25-is5qnl632q-wl.a.run.app` (+ AWS fallback); blocklist only `SubscribedButtonClick`, `Microdata` — **does not** block `AddToWishlist` |
| Live web GTM | **v128** tag **153** maps `add_to_wishlist` → `AddToWishlist` (pixel ID matches) |
| First-party CAPI | `META_PIXEL_ID=1092362672918571`, `action_source=website`, mapper event name `AddToWishlist` |

**Why EM can stay empty despite `/tr` / OpenBridge 200 + CAPI accept:**

1. Meta Graph `/stats` is the independent EM-count proxy we can read: it still shows **zero** `AddToWishlist` after multiple stack-proven fires. `events_received=1` is only an ingress ACK (known Meta failure mode: accept without Overview visibility).
2. Exact spelling is `AddToWishlist` (Meta standard). Searching `AddToWishList` misses it — but Graph zero proves this is not only a UI typo.
3. Several agent smokes used synthetic `fbclid` / polluted `_fbc` (`codex_fbclid_*`, `IwAR0_ic_parity_*`). That may cause post-accept quality drop; it does **not** explain away the need for EM-visible proof.
4. OpenBridge owns browser transport alongside `/tr`; Graph `openbridge_configurations` edge is empty but signals config has live endpoints. Partner view is not a separate pixel ID — still `1092362672918571`.
5. No app/GTM mapping bug found that would send a non-standard name or wrong pixel. **Fix applied: N.**

```text
STACK_WISHLIST_META_FIRE_PROVEN
EVENTS_MANAGER_VISIBLE_NOT_PROVEN   # Graph AddToWishlist count = 0
Fix mapping/GTM republish: NOT REQUIRED (live v128 already maps AddToWishlist)
Do not auto-continue to remove_from_cart / queue #4+
```

**What to open in Events Manager (human):**

1. Business portfolio **Utekos Marketing Data Layer** (or agency share) → Data sources → **Utekos Pixel** `1092362672918571`.
2. **Test events** → select/filter code **`TEST46149`** → look for `AddToWishlist` (probe `fd3c0a4c-…` / live heart click in a clean Incognito with marketing consent).
3. **Overview** (last 1h / 24h) → search exactly `AddToWishlist` — not `AddToWishList`.
4. **Diagnostics** for drops/warnings on this dataset.
5. Meta docs: standard event is `fbq('track', 'AddToWishlist')`; Test Events may lead Overview by 30+ minutes.

### Follow-up fix in same queue item

List/overview variants omit GraphQL `taxable` → Zod reject after persist. Fixed in `22527d290` by defaulting `taxable: true` in `mapShopifyAddToWishlist`.

## Hard stop

Do not auto-continue to `remove_from_cart` / queue #4+. Queue #3 `view_cart` already has separate evidence — this EM gate still blocks claiming wishlist complete.