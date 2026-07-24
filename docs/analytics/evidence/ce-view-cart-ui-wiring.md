# Evidence: view_cart CartDrawer + Meta ViewCart (queue #3)

**Date:** 2026-07-24  
**Start SHA:** `bab92a3ef3d54ce808f9c24802fcca74568eee8f`  
**Roadmap:** Stale-events design queue #3 (`view_cart`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #3 view_cart (design 2026-07-24)
Affected invariants: one visible cart sequence → one event_id; consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: verify CartDrawer emit + params + Google DM ledger path; Pixel map view_cart → ViewCart; trigger 152; reopen fires new sequence
Non-goals: queue #4 remove_from_cart; Meta CAPI outbox (not in matrix); Checkout UI Extensions
Allowed files: CartDrawer, web-meta-pixel.html, view_cart tests, this evidence, GTM tag 153 / trigger 152
Documentation status: design + handoff + matrix + existing catalog/API/Google adapter sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- CartDrawer already wired to `reportCanonicalViewCart` / `mapShopifyViewCart`; reopen now resets revision so each open is a new view sequence.
- Catalog + `/api/events/view-cart` + Google DM outbox already active; Meta CAPI left disabled per matrix (`-`).
- GTM template: `view_cart` → `ViewCart` + commerce payload (isoCurrency fail-closed retained; install-race fix retained).

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/viewCartEvent.test.ts \
  src/lib/analytics/shopifyViewCartCommerce.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes ViewCart + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

Template SHA-256: `a125a05dbe0ae4eec5ee1ad0dec8c2379bbc892f238ea7ea4fb7e2c6667b3039`

## Live / production gates

(pending after commit/push + GTM publish + smoke)

## Hard stop

Do not auto-continue to queue #4 (`remove_from_cart`).
