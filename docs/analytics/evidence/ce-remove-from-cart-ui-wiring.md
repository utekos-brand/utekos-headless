# Evidence: remove_from_cart CartLineItem + Meta RemoveFromCart (queue #4)

**Date:** 2026-07-24  
**Start SHA:** `9ddcbe6dbad74a559d75dcafe96ec44466d428ec`  
**Roadmap:** Stale-events design queue #4 (`remove_from_cart`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #4 remove_from_cart (design 2026-07-24)
Affected invariants: one successful Shopify removal → one event_id; consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: wire CartLineItem remove + quantity-to-zero; Pixel map remove_from_cart → RemoveFromCart (not RemoveCart); trigger 152; rich commerce params
Non-goals: queue #5 scroll_depth; Meta CAPI outbox (not in matrix); Checkout UI Extensions
Allowed files: CartLineItem, web-meta-pixel.html, remove_from_cart tests, this evidence, GTM tag 153 / trigger 152
Documentation status: design + handoff + matrix + existing catalog/API/Google adapter sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- `CartLineItem` trash confirm and quantity-to-zero (minus at qty 1) share the post-mutation `reportCanonicalRemoveFromCart` path (`90768b1df`).
- Catalog + `/api/events/remove-from-cart` + Google DM outbox already active; Meta CAPI left disabled per matrix (`-`).
- GTM template: `remove_from_cart` → `RemoveFromCart` + commerce payload (isoCurrency fail-closed retained; install-race fix retained).

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/removeFromCartEvent.test.ts \
  src/lib/analytics/shopifyRemoveFromCartCommerce.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes RemoveFromCart + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

Template SHA-256: `37f77b66fbe370d5184c3497362acabf8917bdcef8ac305422bd94f1bd322082`

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production tip | **READY** — `90768b1df` (`dpl_8E6aLxg4pKx85vzrfWfn8asEtpfy`) |
| dataLayer `remove_from_cart` after line remove | **PASS** — `48ea1a5d-6ac6-4149-a51e-bcfcafe3e1e9` (`currency=NOK`, `gross_value=1590`, items=1, `cart_mutation_id` present) |
| `POST /api/events/remove-from-cart` | **PASS** — HTTP `202` |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **129** | Meta Pixel remove_from_cart RemoveFromCart - 2026-07-24 | Tag **153** HTML (`remove_from_cart`→`RemoveFromCart` + commerce); trigger **152** regex includes `remove_from_cart`; `supportDocumentWrite` boolean `false`; install-race + isoCurrency retained. Source SHA-256 `37f77b66fbe370d5184c3497362acabf8917bdcef8ac305422bd94f1bd322082`. |

### Meta Pixel `RemoveFromCart` browser parity

| Gate | Status |
|------|--------|
| `window.fbq` + tag 153 initialized | **PASS** |
| Shared `event_id` Pixel↔dataLayer | **PASS** — `__utekosMetaPixelState.sent['RemoveFromCart:48ea1a5d-6ac6-4149-a51e-bcfcafe3e1e9']` |
| Legacy `RemoveCart` | **PASS** — no `RemoveCart:*` keys in Pixel sent map |
| Meta `/tr` RemoveFromCart | Not observed in automated capture (OpenBridge may own transport); Pixel state.sent is authoritative for shared `eventID` |
| Meta CAPI | **N/A** — matrix Meta server = `-` for `remove_from_cart` |
| Events Manager Test Events | Use **TEST30107** (never TEST46149) |

## Hard stop

Do not auto-continue to queue #5 (`scroll_depth`).
