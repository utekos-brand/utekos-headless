# Evidence: remove_from_cart CartLineItem + Meta RemoveFromCart (queue #4)

**Date:** 2026-07-24  
**Start SHA:** `9ddcbe6dbad74a559d75dcafe96ec44466d428ec`  
**Roadmap:** Stale-events design queue #4 (`remove_from_cart`)  
**Tip at Meta EM Test Events GO:** see commit that closes this hard gate

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #4 remove_from_cart (design 2026-07-24)
Affected invariants: one successful Shopify removal → one event_id; consent fail-closed; Meta Pixel eventID = canonical event_id; Meta CAPI RemoveFromCart with shared event_id
Goal: wire CartLineItem remove + quantity-to-zero; Pixel map remove_from_cart → RemoveFromCart (not RemoveCart); trigger 152; rich commerce params; Meta CAPI for EM Test Events
Non-goals: queue #5 scroll_depth; Checkout UI Extensions
Allowed files: CartLineItem, web-meta-pixel.html, remove_from_cart tests, Meta CAPI adapter/mapper, this evidence, GTM tag 153 / trigger 152, matrix/catalog
Documentation status: design + handoff + matrix + catalog/API/Google+Meta adapters sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- `CartLineItem` trash confirm and quantity-to-zero (minus at qty 1) share the post-mutation `reportCanonicalRemoveFromCart` path (`90768b1df`).
- Catalog + `/api/events/remove-from-cart` + Google DM outbox active; Meta CAPI enabled (`RemoveFromCart` M) for EM Test Events parity with AddToWishlist.
- GTM template: `remove_from_cart` → `RemoveFromCart` + commerce payload (isoCurrency fail-closed retained; install-race fix retained).

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/removeFromCartEvent.test.ts \
  src/lib/analytics/shopifyRemoveFromCartCommerce.test.ts \
  src/lib/analytics/server/mapCanonicalRemoveFromCartToMeta.test.ts \
  src/lib/analytics/server/providerRegistryContract.test.ts
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
| Meta CAPI (pre-enable) | **WAS `-`** — root cause of empty EM Test Events. Pixel-only fires do not appear under Test Events code **TEST30107** (production `META_TEST_EVENT_CODE` unset). Graph `/stats` 48h showed `AddToCart=68`, `AddToWishlist=27`, `ViewCart=10`, **`RemoveFromCart=0` / `RemoveCart=0`**. |
| Events Manager Test Events | Use **TEST30107** (never TEST46149) |

## Matrix change — enable Meta CAPI (2026-07-24)

Same bar as AddToWishlist: EM Test Events needs a server event with `test_event_code=TEST30107`.

| Change | Detail |
|--------|--------|
| Catalog | `activeEventProviders(... meta: { eventName: 'RemoveFromCart', ... })` |
| Adapter | `meta:remove_from_cart` → `mapCanonicalCommerceEventToMeta(..., 'RemoveFromCart')` |
| Matrix | Meta column `-` → `RemoveFromCart` M |
| GTM | **v129** unchanged (`remove_from_cart` → `RemoveFromCart`); no republish required for CAPI path |

## Meta Events Manager visibility — GO (EM-VISIBLE)

Hard gate **CLOSED**. Prior Pixel-only path + Graph `/stats` lag (`RemoveFromCart=0`) is superseded by Server Test Events rows under **TEST30107**. Test Events ACK is the GO signal (same as wishlist); Overview / Graph `/stats` may still lag 30–60 min for low-volume events.

| Gate | Status |
|------|--------|
| Direct Graph CAPI probe | **PASS** — `events_received=1`, `fbtrace_id=Ag-EYnykipMQKqUl_DKHhJM` (row 1) |
| Meta Events Manager **Test Events UI** (Pixel `1092362672918571`, code **TEST30107**) | **PASS** — user confirmed two `RemoveFromCart` (Custom event) rows: Processed / Server / Manual Setup |
| Pixel / dataset | `1092362672918571` |
| Test code | **TEST30107** |

### Events Manager Test Events GO — event IDs (user-confirmed)

| # | `event_id` | Time (local) | Name | Value | Currency | `content_ids` | `content_name` | `action_source` | User data |
|---|------------|--------------|------|-------|----------|---------------|----------------|-----------------|-----------|
| 1 | `t30107-RemoveFromCart-1784855701-c9f73fc8` | Today 3:15:01 AM | `RemoveFromCart` | `1590` | `NOK` | `["46944403882232"]` | TechDown | `website` | External id, IP, UA |
| 2 | `t30107-RemoveFromCart-1784855899-f20f7723` | Today 3:18:19 AM | `RemoveFromCart` | `1590` | `NOK` | `["42903231037688"]` | Mikrofiber | `website` | (same session / Test Events) |

URL context: `https://utekos.no/`. Params include `content_type=product`, `contents` with qty 1 / `item_price` 1590.

## Hard stop (queue advance)

Hard gate for queue #4 is **CLOSED** (EM-VISIBLE confirmed).  
Do **not** auto-continue to queue #5 (`scroll_depth`).
